import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { AppLayout } from "./components/AppLayout";
const theme = createTheme({
  primaryColor: "teal",
  fontFamily: "Inter, system-ui, sans-serif",
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <AppLayout />
    </MantineProvider>
  );
}

export default App;
