import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Presale from './Component/presale/Presale';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Presale />
    </div>
  );
}

export default App;
