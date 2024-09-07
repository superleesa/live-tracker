import { create } from 'zustand';


enum DataSourceType {
    Number,
    NumberPair,
    NumberList,
    Text,
    Image,
}

interface Subscriber{
    id: string;
    updateCallback: (data: any) => void;
}

interface DataSource{
    id: number;
    name: string;
    type: DataSourceType;
}

interface WenSocketManagerState {
    socket: WebSocket | null;
    pendingRequests: Record<string, (data: any) => void>;
    availableDataSources: Set<DataSource>;
    dataSourceToSubscripters: Record<number, Set<Subscriber>>;
    subscripterToDataSource: Record<string, DataSource>;
    connect: (url: string) => void;
    sendMessage: (message: any) => Promise<any>;
    subscribe: (dataSource: DataSource, callback: (data: any) => void) => Subscriber;
    unsubscribe: (subscriber: Subscriber) => void;
}

const useWebsocketConnector = create<WenSocketManagerState>((set, get) => ({
  socket: null,
  pendingRequests: {},

  // TODO: separete websocket logic from business logic
  // see: slice pattern (https://github.com/pmndrs/zustand/blob/main/docs/guides/slices-pattern.md)
  availableDataSources: new Set(),
  dataSourceToSubscripters: {},  // data source to callback
  subscripterToDataSource: {},  // subscripter to its data sources
  // TODO: can have cache to store data source to its records (because multiple components can subscribe to same data source)


  connect: (url) => {
    if (get().socket) return;

    const ws = new WebSocket(url);

    ws.onopen = () => set({ socket: ws });

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { id, data } = message;
        
        // handing pending requests
        // this occurs when one component sent a message to the server and then the server responds with a data
        if (id && get().pendingRequests[id]) {
            get().pendingRequests[id](data);  // this resolves the promise
            const updatedRequests = { ...get().pendingRequests };
            delete updatedRequests[id];
            set({ pendingRequests: updatedRequests });
        }

        // TODO: add routing
        // when server sends data to us actively
        // if data source of the received data is not in available data sources, then add it
        if (!get().availableDataSources.has(data.dataSource)) {
            set({ availableDataSources: new Set([...get().availableDataSources, data.dataSource]) });
        }

        //broadcast to all subscribers by calling callback
        const subscribers = get().dataSourceToSubscripters[data.dataSource.id];
        subscribers.forEach((subscriber) => {
            subscriber.updateCallback(data);
        });

    };

    ws.onclose = () => set({ socket: null });
  },

  sendMessage: (message) => {
    const socket = get().socket;
    if (!socket){
        throw new Error('Connect socket first before sending message');
    }
    
    const id = messageIdGenerator();
    const fullMessage = { ...message, id };
    socket.send(JSON.stringify(fullMessage));

    return new Promise((resolve) => {
    set((state) => ({
        pendingRequests: { ...state.pendingRequests, [id]: resolve },
    }));
    });
    
  },
  subscribe: (dataSource, updateCallback) => {
    const dataSourceToSubscripters = { ...get().dataSourceToSubscripters }; // FIXME??
    if (!(get().availableDataSources.has(dataSource))) {
        throw new Error(`Data source ${dataSource} is not available`);
    }
    const subscriberToDataSource = { ...get().subscripterToDataSource };

    const subscriberId = subscriberIdGenerator()
    const subscriber: Subscriber = { id: subscriberId, updateCallback };
    dataSourceToSubscripters[dataSource.id].add(subscriber);
    subscriberToDataSource[subscriberId] = dataSource;
    set({ dataSourceToSubscripters: dataSourceToSubscripters });
    return subscriber;
  },
  unsubscribe: (subscriber) => {
    const subscripterToDataSource = get().subscripterToDataSource;
    const subscribedDataSource =  subscripterToDataSource[subscriber.id];
    delete subscripterToDataSource[subscriber.id];
    const dataSourceToSubscripters = get().dataSourceToSubscripters;
    dataSourceToSubscripters[subscribedDataSource.id].delete(subscriber);

    set({ dataSourceToSubscripters: dataSourceToSubscripters });
    set({ subscripterToDataSource: subscripterToDataSource });
  }

}));

export default useWebsocketConnector;


function getNumberIncrementor() {
    let counter = 0;
    return () => {
        counter += 1;
        return counter.toString();
    };
}
const messageIdGenerator = getNumberIncrementor();
const subscriberIdGenerator = getNumberIncrementor();