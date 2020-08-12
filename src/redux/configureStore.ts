import { createStore, applyMiddleware } from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
import reducer from './reducers'
 

const loggerMiddleware = createLogger({
    collapsed: true,
    predicate: () => __DEV__,
    logger: { ...console, log: console.trace }
})

const middleWare = applyMiddleware(thunkMiddleware, loggerMiddleware);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['authReducer', 'vehicles', 'appReducer', 'preferences', 'trips', 'subscriber']
}

const persistorCallbackPromises: any[] =[];
let persistorFinished = false;
const persistedReducer = persistReducer(persistConfig, reducer);

// Create the store
let store = createStore(persistedReducer, undefined, middleWare);

console.log(store.getState());

// Persisting state changes
const onFinishPersist = (timeout: number=0)=> new Promise((resolve,reject) => {
    if (persistorFinished) return resolve(true);
    persistorCallbackPromises.push(() => {
        resolve(true);
    })

    if (timeout) setTimeout(()=>{
        if (!persistorFinished) reject(new Error('Persistor timed out'))
    },timeout);
});

// persistor 
const persistor = persistStore(store, null, () => {
    persistorFinished = true;
    persistorCallbackPromises.forEach(c => c());
})
 
export { persistor, store, onFinishPersist };