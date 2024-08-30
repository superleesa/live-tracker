"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import './globals.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import Header from './Header';
import { SelectableBox } from './selectionBox';


class DataSource {
  name: string;
  data_type: string;
  data?: number[];

  constructor(name: string, data_type: string, data?: number[]) {
    this.name = name;
    this.data_type = data_type;
    this.data = data;
  }
}

function get_available_plot_types(data_sources: DataSource[]): string[] {
  const dataTypeToPlotType: { [key: string]: string[] } = {
    "number-number": ["line", "bar", "scatter"],
    "image": ["image"],
    "text": ["text"]
  };

  if (data_sources.length == 1) {
    return dataTypeToPlotType[data_sources[0].data_type];
  }else if (data_sources.length != 0 && data_sources.every(data_source => data_source.data_type === "number-number")){
    return ["line"]
  }else{
    return []
  }
}

function NewPlotBox() {
  const [plotSelected, setPlotSelected] = useState(null);  // store null or PlotType
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>([]);
  const avalailablePlotTypes = get_available_plot_types(selectedDataSources);
  console.log(selectedDataSources);
  console.log(avalailablePlotTypes);

  // useEffect(() => {
  //   const updatedPlotTypes = get_available_plot_types(selectedDataSources);
  //   setAvailablePlotTypes(updatedPlotTypes);
  // }, [selectedDataSources]);


  // TODO: i think we should have enum of data types (e.g. number, image, text) and plot types (e.g. line, bar, scatter)
  const availableDataSourcesRef = useRef<DataSource[]>([new DataSource("data source 1", "number-number"), new DataSource("data source 2", "number-number"), new DataSource("data source 3", "text")])  // this is a mock data source; TODO: fetch from backend
  const availableDataSources = availableDataSourcesRef.current;
  const dataSource1 = [[0,10], [1, 4], [2, 5], [3, 10], [4, 7]]  // TODO: we need to fetch this from the backend

  return (
    <div className={styles.box}>
      <h1>Add New Plot</h1>
      <FontAwesomeIcon icon={faPlusCircle} size="3x" />
      {!plotSelected &&
        <Popup
          trigger={open => (
            <div>
              <button className="button">Trigger - {open ? 'Opened' : 'Closed'}</button>
            </div>
          )}
          modal
          closeOnDocumentClick
        >
          {((close: () => void) => (
            <div>
              <div className={styles.plot_section_window}>
                <h1>Select Plot</h1>
                <div style={{ marginBottom: "30px" }}>
                  <h2>1. Select Data Source(s)</h2>
                  <div className={styles.selectee_box_wrapper}>
                    {availableDataSources.length === 0 ? <p>No data sources available</p> :
                      (availableDataSources.map((dataSource) => (
                        <SelectableBox name={dataSource.name} onClick={() => {
                          // highlight this button (just add a css class)
                          // update available plot types that can be selected
                          // TODO: if more than one data source is selected, we should have a way to combine them
                          if (selectedDataSources.includes(dataSource)) {
                            setSelectedDataSources(selectedDataSources.filter((ds) => ds != dataSource));
                          } else {
                            setSelectedDataSources([...selectedDataSources, dataSource]);
                          }
                        }} />
                      ))
                      )
                    }

                  </div>
                </div>
                <div>
                  <div>
                    <h2>2. Select Plot Type</h2>
                    <div className={styles.selectee_box_wrapper}>
                      {Object.keys(avalailablePlotTypes).length === 0 ? <p>No compatible plots available</p> :
                        (avalailablePlotTypes.map((plotType) => (
                          <SelectableBox name={plotType} onClick={() => {
                            // highlight this button (just add a css class)
                            // 

                          }} />
                        ))
                        )
                      }
                    </div>
                  </div>
                </div>

              </div>
              <button onClick={() => {
                setPlotSelected(true);  // TODO: there should be a communication with the backend that this user has selected this plot
                close();
              }}>
                Select Plot
              </button>
            </div>
          )) as unknown as React.ReactNode}
        </Popup>
      }
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
