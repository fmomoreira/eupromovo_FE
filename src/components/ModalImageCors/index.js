import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  messageMedia: {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
}));

const ModalImageCors = ({ imageUrl }) => {
  const classes = useStyles();
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    const fetchImage = async () => {
      try {
        const { data, headers } = await api.get(imageUrl, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers["content-type"] })
        );

        console.log("IMAGE URL: " + imageUrl);
        console.log("API URL", api);
        console.log("BUSCANDO IMAGEM", url);
        setBlobUrl(url);
        setFetching(false);
      } catch (error) {
        console.log("ERRO AO CARREGAR A IMAGEM", error);
      }
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <ModalImage
      className={classes.messageMedia}
      smallSrcSet={fetching ? imageUrl : blobUrl}
      medium={fetching ? imageUrl : blobUrl}
      large={fetching ? imageUrl : blobUrl}
      alt="image"
    />
  );
};

export default ModalImageCors;
