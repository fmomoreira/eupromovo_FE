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
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";

import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";

import Paper from "@material-ui/core/Paper";
import MainHeader from "../MainHeader";
import axios from "axios";
import ProductIcon from "@material-ui/icons/LocalMall";

const useStyles = makeStyles((theme) => ({
  sendMessageIcons: {
    color: "grey",
  },
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
    display: "flex",
    flexDirection: "row",
    padding: "16px",
    paddingTop: "0",
    rowGap: "2rem",
    justifyContent: "",
    alignItems: "end",
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

const ProductListModal = ({
  open,
  onClose,
  contactId,
  initialValues,
  onSave,
  setInput,
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

  const [products, setProducts] = useState([]);
  const [productList, setProductList] = useState([]);

  const [showSelectList, setShowSelectList] = useState(false);
  const [filterSelect, setFilterSelect] = useState("descricao");

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
      // const fetchContacts = async () => {
      //   try {
      //     const token = localStorage.getItem("@token");
      //     const codLoja = localStorage.getItem("@codloja");

      //     let link = `http://localhost:8787/estoques/loja/${codLoja}`;

      //     const headers = {
      //       Authorization: token,
      //       tid: "04888471000139".replace(/[^0-9]/g, ""),
      //     };

      //     const response = await axios.get(link, { headers, timeout: 10000 });
      //     if (response.status !== 200) {
      //       throw new Error(response.statusText);
      //     }

      //     console.log("JSON LOJA", response.data);

      //     setProducts(response.data);
      //     // setHasMore(data.hasMore);
      //     setLoading(false);
      //   } catch (err) {
      //     console.log("ERRO CARREGANDO PRODUTOS");
      //     toastError(err);
      //   }
      // };
      // fetchContacts();
      pesquisar(searchParam !== "" ? 1 : 2);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const pesquisar = async (tipo) => {
    try {
      const token = localStorage.getItem("@token");
      const codLoja = localStorage.getItem("@codloja");

      setLoading(true);
      let servidor = "localhost:8787";

      let link = `http://${servidor}/estoques/loja/${codLoja}`;
      let ok = true;

      if (tipo === 1) {
        if (searchParam === "") {
          ok = false;
        }
        link = `http://${servidor}/estoques/${codLoja}/${filterSelect}/${searchParam}`;
      }

      if (ok) {
        const headers = {
          Authorization: token,
          tid: "04888471000139".replace(/[^0-9]/g, ""),
        };

        const response = await axios.get(link, { headers, timeout: 10000 });
        if (response.status !== 200) {
          throw new Error(response.statusText);
        }

        const json = response.data;
        setProducts(json);
      }
    } catch (error) {
      console.log("ERROR REQUEST PRODUCTS", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSelectProduct = (product) => {
    console.log("PRODUCT", product);

    console.log("LISTA ATUAL", productList);
    setProductList((list) => {
      const productExist = list?.some(
        (item) => item.produto.idProd === product.produto.idProd
      );

      if (!productExist) {
        return [...list, { ...product, qtd: 1, total: product.precovendaProd }];
      } else {
        return list.filter(
          (item) => item.produto.idProd !== product.produto.idProd
        );
      }
    });
  };

  const handleAddContact = async () => {
    console.log("VALUES RECEBIDO", productList);
    const message = generateWhatsAppMessage(productList);
    setInput(message);
    handleClose();
  };

  const generateWhatsAppMessage = (productList) => {
    if (!productList || productList.length === 0)
      return "Nenhum produto selecionado.";

    let message = "🛒 *Resumo do Pedido*\n\n";

    productList.forEach((item, index) => {
      const nome = item.produto.descricaoProd;
      const valorUnitario = Number(item.precovendaProd).toFixed(2);
      const quantidade = item.qtd;
      const desconto = item.descontoProd ?? 0;
      const valorTotal = Number(item.total).toFixed(2);

      message += `🔹 *Produto ${index + 1}:* ${nome}\n`;
      message += `💰 *Valor Unitário:* R$ ${valorUnitario}\n`;
      message += `📦 *Quantidade:* ${quantidade}\n`;
      message += `🎯 *Desconto:* ${desconto}%\n`;
      message += `💵 *Total:* R$ ${valorTotal}\n\n`;
    });

    const totalGeral = productList
      .reduce((acc, item) => acc + Number(item.total), 0)
      .toFixed(2);
    message += `🧾 *Total Geral: R$ ${totalGeral}*`;

    return message;
  };

  const handleQtdChange = (id, value) => {
    setProductList((prevList) =>
      prevList.map((item) =>
        item.produto.idProd === id
          ? {
              ...item,
              qtd: Math.max(1, Math.min(value, item.estoque)),
              total: calculateTotal(
                item.precovendaProd,
                item.descontoProd,
                Math.max(1, Math.min(value, item.estoque))
              ),
            }
          : item
      )
    );
  };

  const handleDiscountChange = (id, value) => {
    // Impede valores negativos e mantém o campo editável
    if (value === "" || Number(value) >= 0) {
      setProductList((prevList) =>
        prevList.map((item) =>
          item.produto.idProd === id
            ? {
                ...item,
                descontoProd: value, // Permite string vazia enquanto edita
                total: calculateTotal(
                  item.precovendaProd,
                  value || 0,
                  item.qtd
                ),
              }
            : item
        )
      );
    }
  };

  // Se o campo for apagado, redefine para 0 ao perder o foco
  const handleDiscountBlur = (id, value) => {
    setProductList((prevList) =>
      prevList.map((item) =>
        item.produto.idProd === id
          ? { ...item, descontoProd: value === "" ? "0" : value }
          : item
      )
    );
  };

  // Função para calcular o total com base na quantidade e no desconto percentual
  const calculateTotal = (price, discount, qtd) => {
    const discountFactor = 1 - discount / 100;
    return (price * discountFactor * qtd).toFixed(2); // Mantém duas casas decimais
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
        <DialogTitle id="form-dialog-title">
          {!showSelectList ? "Selecionar Produto" : "Produtos Selecionados"}
        </DialogTitle>

        {!showSelectList && (
          <div className={classes.searchInput}>
            <TextField
              style={{ width: "50%", paddingRight: "16px" }}
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
            <FormControl variant="outlined" style={{ width: "20%" }}>
              <InputLabel>Filtrar por</InputLabel>
              <Select
                value={filterSelect}
                onChange={(e) => setFilterSelect(e.target.value)}
                label="Filtrar por"
              >
                <MenuItem value="descricao">Nome do Produto</MenuItem>
                <MenuItem value="codigo">Código do Produto</MenuItem>
                <MenuItem value="codigobarra">Código de Barras</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          <Table size="small">
            {!showSelectList ? (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                    <TableCell align="center">Código</TableCell>
                    <TableCell align="center">Cód. Barras</TableCell>
                    <TableCell align="center">Preço</TableCell>
                    <TableCell align="center">Estoque</TableCell>
                    <TableCell align="center">Selecionar </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products?.map((item) => (
                    <TableRow key={item?.id}>
                      {/* <TableCell style={{ paddingRight: 0 }}>
                       <ProductIcon className={classes.sendMessageIcons} />
                     </TableCell> */}
                      <TableCell>{item?.produto.descricaoProd}</TableCell>
                      <TableCell align="center">
                        {item?.produto.idProd}
                      </TableCell>
                      <TableCell align="center">
                        {item?.codigoBarras.numeroCodbar}
                      </TableCell>
                      {/* <TableCell align="center">
                       {item?.produto?.fabricanteFk?.nomeFab}
                     </TableCell> */}
                      <TableCell align="center">
                        {item?.precovendaProd}
                      </TableCell>
                      <TableCell align="center">{item?.estoque}</TableCell>
                      {/* <TableCell align="center">{item?.descontoProd}</TableCell> */}
                      {/* <TableCell align="center">{item?.acrescimo}</TableCell> */}
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={item.estoque == 0}
                              checked={productList?.some(
                                (product) =>
                                  product.produto.idProd === item.produto.idProd
                              )}
                              onChange={() => handleSelectProduct(item)}
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
                </TableBody>
              </>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                    <TableCell align="center">Preço</TableCell>
                    <TableCell align="center">Estoque</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="center">Desconto</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Selecionar </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productList?.map((item) => (
                    <TableRow key={item?.id}>
                      <TableCell>{item?.produto.descricaoProd}</TableCell>
                      <TableCell align="center">
                        {item?.precovendaProd}
                      </TableCell>
                      <TableCell align="center">{item?.estoque}</TableCell>
                      <TableCell align="center">
                        <TextField
                          style={{ width: "50%" }}
                          type="number"
                          value={item.qtd}
                          onChange={(e) =>
                            handleQtdChange(item.produto.idProd, e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          style={{ width: "50%" }}
                          type="number"
                          value={item.descontoProd}
                          onChange={(e) =>
                            handleDiscountChange(
                              item.produto.idProd,
                              e.target.value
                            )
                          }
                          onBlur={(e) =>
                            handleDiscountBlur(
                              item.produto.idProd,
                              e.target.value
                            )
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">%</InputAdornment>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{item?.total}</TableCell>

                      {/* <TableCell align="center">{item?.acrescimo}</TableCell> */}
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={item.estoque == 0}
                              checked={productList?.some(
                                (product) =>
                                  product.produto.idProd === item.produto.idProd
                              )}
                              onChange={() => handleSelectProduct(item)}
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
                </TableBody>
              </>
            )}
          </Table>
        </Paper>

        <DialogActions>
          {!showSelectList ? (
            <>
              <Button
                onClick={() => {
                  setProductList([]);
                  handleClose();
                }}
                color="secondary"
                variant="outlined"
              >
                {i18n.t("contactModal.buttons.cancel")}
              </Button>
              <Button
                onClick={() => {
                  setShowSelectList(true);
                }}
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
              >
                Avançar
                {/* {isSubmitting && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )} */}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setShowSelectList(false);
                  // handleClose();
                }}
                color="secondary"
                variant="outlined"
              >
                Voltar
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
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductListModal;
