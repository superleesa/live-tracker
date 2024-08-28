import Image from "next/image";
import styles from "./page.module.css";
import './globals.css';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css"; 

function NewPlotBox() {
  return (
    <div className={styles.box}>
      <h1>Add New Plot</h1>
      <FontAwesomeIcon icon={faPlusCircle} size="3x" />
    </div>
  );
}

function PlotBoxWrapper() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80%' }}>
      <NewPlotBox />
      {/* Add more NewPlotBox components if needed */}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <Header />
      <main style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <PlotBoxWrapper />
      </main>
    </div>
  );
}
