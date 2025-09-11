"use client";

import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// Required so pickers' component keys exist in theme typing:
import "@mui/x-date-pickers/themeAugmentation";

const theme = createTheme({
  palette: {
    primary: { main: "#000000" },
    text: { primary: "#000000" },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-selected": {
            backgroundColor: "#000000",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#000000" },
          },
        },
      },
    },

    MuiDigitalClock: {
      styleOverrides: {
        root: {
          color: "#000000",
          "& .MuiButtonBase-root.Mui-selected": {
            backgroundColor: "#000000",
            color: "#ffffff",
          },
        },
      },
    },

    MuiMultiSectionDigitalClock: {
      styleOverrides: {
        root: {
          color: "#000000",
          "& .MuiButtonBase-root.Mui-selected": {
            backgroundColor: "#000000",
            color: "#ffffff",
          },
        },
      },
    },

    MuiClockNumber: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-selected": {
            color: "#ffffff",
            backgroundColor: "#000000",
          },
        },
      },
    },
  },
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
