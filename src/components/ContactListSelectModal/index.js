import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useReducer,
} from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Avatar from "@material-ui/core/Avatar";
import TableRowSkeleton from "../TableRowSkeleton";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControlLabel } from "@material-ui/core";

import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";

import Paper from "@material-ui/core/Paper";
import MainHeader from "../MainHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchInput: {
    flex: 1,
    padding: "16px",
    paddingTop: "0",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact?.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact?.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const ContactListSelectModal = ({
  open,
  onClose,
  contactId,
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const {
    user: { companyId },
  } = useContext(AuthContext);
  const { contactListId } = useParams();

  const initialState = {
    name: "",
    number: "",
    email: "",
    cep: "",
    cpf_cnpj: "",
    bairro: "",
    cidade: "",
    endereco: "",
  };

  const [contact, setContact] = useState(initialState);

  const [contacts, dispatch] = useReducer(reducer, []);

  const [loading, setLoading] = useState();
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [contactList, setContactList] = useState([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!contactId) return;

      try {
        const { data } = await api.get(`/contact-list-items/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleSelectContact = (contact) => {
    setContactList((list) => {
      const contactExist = list.some((item) => item.id === contact.id);

      if (!contactExist) {
        return [...list, contact];
      } else {
        return list.filter((item) => item.id !== contact.id);
      }
    });
  };

  const handleAddContact = async (selectContacts) => {
    console.log("VALUES RECEBIDO", contactList);

    const requests = contactList.map((contact) =>
      api.post("/contact-list-items", {
        ...contact,
        companyId,
        contactListId,
      })
    );

    const responses = await Promise.all(requests);
    try {
      if (onSave) {
        responses.forEach(({ data }) => onSave(data));
      }
      handleClose();
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">Selecionar Contato</DialogTitle>

        <div className={classes.searchInput}>
          <TextField
            style={{ flex: 1, width: "100%" }}
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.whatsapp")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.email")}
                </TableCell>
                <TableCell align="center">CPF/CNPJ</TableCell>
                <TableCell align="center">CEP</TableCell>
                <TableCell align="center">Cidade</TableCell>
                <TableCell align="center">Bairro</TableCell>
                <TableCell align="center">Endereço</TableCell>
                <TableCell align="center">Selecionar </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {contacts.map((contact) => (
                  <TableRow key={contact?.id}>
                    <TableCell style={{ paddingRight: 0 }}>
                      {<Avatar src={contact?.profilePicUrl} />}
                    </TableCell>
                    <TableCell>{contact?.name}</TableCell>
                    <TableCell align="center">{contact?.number}</TableCell>
                    <TableCell align="center">{contact?.email}</TableCell>
                    <TableCell align="center">{contact?.cpf_cnpj}</TableCell>
                    <TableCell align="center">{contact?.cep}</TableCell>
                    <TableCell align="center">{contact?.cidade}</TableCell>
                    <TableCell align="center">{contact?.bairro}</TableCell>
                    <TableCell align="center">{contact?.endereco}</TableCell>
                    <TableCell align="center">
                      <FormControlLabel
                        control={
                          <Checkbox
                            // checked={kanban === 1}
                            onChange={() => handleSelectContact(contact)}
                            // value={kanban}
                            color="primary"
                          />
                        }
                        labelPlacement="start"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton avatar columns={2} />}
              </>
            </TableBody>
          </Table>
        </Paper>

        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {i18n.t("contactModal.buttons.cancel")}
          </Button>
          <Button
            onClick={handleAddContact}
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
          >
            {i18n.t("contactModal.buttons.okAdd")}
            {/* {isSubmitting && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )} */}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ContactListSelectModal;
