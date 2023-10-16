import Consumer from "./components/Consumer";
import Streamer from "./components/Streamer";
export default function App() {
  const searchParams = new window.URLSearchParams(window.location.search);
  const isStreamer = searchParams.has("stream");

  const PeerContainer = isStreamer ? Streamer : Consumer;
  return <PeerContainer/>
}