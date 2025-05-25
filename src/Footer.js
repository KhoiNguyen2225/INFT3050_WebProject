//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for the footer of the website
//Last modified: 11/03/2024
//source: https://gist.github.com/SahanAmarsha/c36b57572679ae0ab8e9773b70120ed4
import { Box, Container, Grid, Typography } from "@mui/material";
import React, {useEffect} from 'react';

const Footer =() => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        backgroundColor: "#A189A9",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <Container maxWidth="lg">
        <Grid container direction="column" alignItems="center">
          <Grid item xs={12}>
            <Typography color="black" variant="h5">
              Entertainment Guild
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography color="textSecondary" variant="subtitle1">
              {`${new Date().getFullYear()} | Facebook | Instagram | LinkedIn | Twitter`}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>

  );
};

export default Footer;
