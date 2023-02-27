import { ConnectError, createPromiseClient } from "@bufbuild/connect";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useState } from "react";
import TabPanel from "./api/components/TabPanel";
import { InterviewService } from "./api/interview_service_connectweb";
import "./App.css";

const transport = createGrpcWebTransport({
  baseUrl: "http://10.1.10.101:8082",
});
const client = createPromiseClient(InterviewService, transport);

function App() {
  const [helloInput, setHelloInput] = useState("");
  const [helloReply, setHelloReply] = useState("");
  const [helloError, setHelloError] = useState(false);

  const [data, setData] = useState([] as string[]);

  const [currentTab, setCurrentTab] = useState(0);

  async function handleHello(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await client.hello({ message: helloInput });
      setHelloReply(response.reply);
      setHelloError(false);
    } catch (e) {
      if (!(e instanceof ConnectError)) throw e;
      if (e.message === "[unknown] NotPolite") setHelloError(true);
    }
  }

  async function startStreaming() {
    for await (const response of client.dataStream({})) {
      setData((oldData) => [...oldData, response.data]);
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Hello" />
          <Tab label="Data Stream" />
        </Tabs>
      </Box>
      <TabPanel value={currentTab} index={0}>
        <form onSubmit={handleHello}>
          <Grid container={true}>
            <TextField
              label="Send a message"
              value={helloInput}
              error={helloError}
              helperText={
                helloError && 'Your message must include the word "hello"'
              }
              onChange={(e) => setHelloInput(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </Grid>
          <br />
          {!helloError && helloReply}
        </form>
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <Button type="button" onClick={startStreaming}>
          Start Streaming
        </Button>
        <List>
          {data.map((datum, i) => (
            <ListItem key={i}>
              <ListItemText>{datum}</ListItemText>
            </ListItem>
          ))}
        </List>
      </TabPanel>
    </>
  );
}

export default App;
