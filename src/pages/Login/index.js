import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import logoDraw from "../../assets/logo-red.png";
// import logoDraw from "../../assets/logo-side.png";
// import logo from "../../assets/logo-login.png";
import logo from "../../assets/logo-red.png";
// import { versionSystem } from "../../../package.json";
// import { nomeEmpresa } from "../../../package.json";

const Copyright = () => {
  return (
    <Typography variant="body2" color="primary" align="center">
      {"Copyright "}
      <Link color="primary" href="#">
        Eu Promovo Saas - v 10.7.0
        {/* {nomeEmpresa} - v {versionSystem} */}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#ffffff",
    // background: "linear-gradient(to right, #0000FF , #0000FF , #0000FF)",
    //backgroundImage: "url(https://i.imgur.com/CGby9tN.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  paper: {
    backgroundColor: theme.palette.login, //DARK MODE PLW DESIGN//
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "55px 30px",
    width: "auto",
    borderRadius: "12.5px",
    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.35)",
  },
  leftPaper: {
    display: "flex",
    width: "50vw",
    height: "100vh",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  powered: {
    color: "white",
  },
}));

const Login = () => {
  const classes = useStyles();

  const [user, setUser] = useState({ email: "", password: "" });

  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <div className={classes.leftPaper}>
        <div
          style={{
            height: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            style={{
              margin: "0",
              // height: "200px",
              width: "200px",
              height: "auto",
              // width: "375px",
              objectFit: "contain",
            }}
            src={logo}
            alt="Whats"
          />
        </div>
      </div>
      <Container component="main" maxWidth="xs" style={{}}>
        <CssBaseline />
        <div className={classes.paper}>
          <div
            style={{
              height: "auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <img
              style={{
                margin: "0",
                // height: "50px",
                // width: "100%",
                height: "50px",
                width: "375px",
                objectFit: "contain",
              }}
              src={logoDraw}
              alt="Whats"
            />
            <span style={{ fontWeight: "bold" }}>Login</span>
            {/* <img
              style={{ margin: "0", width: "auto" }}
              src={logoDrawTitle}
              alt="Whats"
            /> */}
          </div>
          {/*<Typography component="h1" variant="h5">
					{i18n.t("login.title")}
				</Typography>*/}
          <form className={classes.form} noValidate onSubmit={handlSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label={i18n.t("login.form.email")}
              name="email"
              value={user.email}
              onChange={handleChangeInput}
              autoComplete="email"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password")}
              type="password"
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
            />

            <Grid container justify="flex-end">
              <Grid item xs={6} style={{ textAlign: "right" }}>
                <Link component={RouterLink} to="/forgetpsw" variant="body2">
                  Esqueceu sua senha?
                </Link>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {i18n.t("login.buttons.submit")}
            </Button>
            {
              <Grid container>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    component={RouterLink}
                    to="/signup"
                  >
                    {i18n.t("login.buttons.register")}
                  </Link>
                </Grid>
              </Grid>
            }
          </form>
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </div>
  );
};

export default Login;
