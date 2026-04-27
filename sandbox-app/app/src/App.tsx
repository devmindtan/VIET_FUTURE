import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { AppLayout } from "./components/AppLayout";
import "./styles/ui.css";

const theme = createTheme({
  primaryColor: "cyan",
  defaultRadius: "md",
  fontFamily: '"Sora", "Trebuchet MS", "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Sora", "Trebuchet MS", "Segoe UI", sans-serif',
    fontWeight: "700",
  },
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <AppLayout />
    </MantineProvider>
  );
}

export default App;
