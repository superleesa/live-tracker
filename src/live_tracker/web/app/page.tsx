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
import LineChart from './lineChart';
import { DataSource, DataFormatBase, NumberPairFormat, TextFormat, ImageFormat } from './dataSource';



function getChart(dataSources: DataSource<NumberPairFormat>[], plotType: string): React.FC {
  // fetch data from the backend
  for (const dataSource of dataSources) {
    dataSource.fetchData();
  }
  if (plotType === "line") {
    return <LineChart dataSources={dataSources} />
  }
  // TODO: add more chart types
  throw new Error("Invalid plot type");
}

function get_available_plot_format(data_sources: DataSource<DataFormatBase>[]): string[] {
  const dataTypeToPlotType: { [key: string]: string[] } = {
    "number-number": ["line", "bar", "scatter"],
    "image": ["image"],
    "text": ["text"]
  };

  if (data_sources.length == 1) {
    return dataTypeToPlotType[data_sources[0].format];
  }else if (data_sources.length != 0 && data_sources.every(data_source => data_source.format === "number-number")){
    return ["line"]
  }else{
    return []
  }
}

function NewPlotBox() {
  const [plotFormat, setPlotFormat] = useState<string | null>(null);  // store null or PlotType
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource<DataFormatBase>[]>([]);
  const [plot, setPlot] = useState<React.FC | null>(null);

  // TODO: i think we should have enum of data types (e.g. number, image, text) and plot types (e.g. line, bar, scatter)
  const availableDataSourcesRef = useRef<DataSource<DataFormatBase>[]>([new DataSource<NumberPairFormat>("data source 1", "number-number"), new DataSource<NumberPairFormat>("data source 2", "number-number"), new DataSource<TextFormat>("data source 3", "text")])  // this is a mock data source; TODO: fetch from backend
  const availableDataSources = availableDataSourcesRef.current;
  const avalailablePlotFormat = get_available_plot_format(selectedDataSources);

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
                      {Object.keys(avalailablePlotFormat).length === 0 ? <p>No compatible plots available</p> :
                        (avalailablePlotFormat.map((plot_format) => (
                          <SelectableBox name={plot_format} onClick={() => {
                            // highlight this button (just add a css class)
                            setPlotFormat(plot_format);
                          }} />
                        ))
                        )
                      }
                    </div>
                  </div>
                </div>

              </div>
              <button onClick={() => {
                if (!plotFormat) {
                  // TODO: add css class to show that the user needs to select a plot
                  return;
                }
                const plot = getChart(selectedDataSources as DataSource<NumberPairFormat>[], plotFormat);
                setPlot(plot);  // TODO: there should be a communication with the backend that this user has selected this plot
                close();
              }}>
                Select Plot
              </button>
            </div>
          )) as unknown as React.ReactNode}
        </Popup>
      }
<div style={{width: "100%"}}>
        {plot && <div>{plot}</div>}
      </div>
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
