import { ConnectError, createPromiseClient } from "@bufbuild/connect";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { useState } from "react";
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

  return (
    <>
      <header>Header</header>
      <section>
        <form onSubmit={handleHello}>
          <input
            value={helloInput}
            onChange={(e) => setHelloInput(e.target.value)}
          />
          <button type="submit">Send</button>
          <br />
          {helloError
            ? 'Your message must include the word "hello"'
            : helloReply}
        </form>
      </section>
    </>
  );
}

export default App;
