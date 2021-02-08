import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native'

import RNIap, {
  Product,
  ProductPurchase,
  PurchaseError,
  acknowledgePurchaseAndroid,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap'

const itemSkus = Platform.select({
  ios: ['rosival.souza.com.RNapplePay'],
  android: ['com.example.productId'],
})

const itemSubs = Platform.select({ ios: ['passvipnew'], android: ['test.sub'] })
let purchaseUpdateSubscription, purchaseErrorSubscription

export default function App() {

  const [productList, setProductList] = useState([])
  const [receipt, setReceipt] = useState([])
  const [availableItemsMessage, setAvailableItemsMessage] = useState([])


  useEffect(() => {

    /* connect itunes Store */
    (async function initialize() {

      try {
        const result = await RNIap.initConnection()
        console.log('connection is => ', result)
        // await RNIap.consumeAllItemsAndroid()

      } catch (err) {
        console.log('error in cdm => ', err)
      }

      purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase) => {

          console.log('purchaseUpdatedListener', purchase)
          if (
            purchase.purchaseStateAndroid === 1 &&
            !purchase.isAcknowledgedAndroid
          ) {
            try {
              const ackResult = await acknowledgePurchaseAndroid(
                purchase.purchaseToken,
              )
              console.log('ackResult', ackResult)
            } catch (ackErr) {
              console.warn('ackErr', ackErr)
            }
          }
          purchaseConfirmed()
          // this.setState({ receipt: purchase.transactionReceipt })
          purchaseErrorSubscription = purchaseErrorListener(
            (error) => {
              console.log('purchaseErrorListener', error)
              // alert('purchase error', JSON.stringify(error))
            },
          )
        },
      )

    })()

    return () => {

      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove()
        purchaseUpdateSubscription = null
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove()
        purchaseErrorSubscription = null
      }
    }

  }, [])

  const getItems = async () => {

    
    try {

      console.log('itemSkus[0]', itemSkus[0])

      const products = await RNIap.getProducts(itemSkus)

      alert(JSON.stringify(products))

      console.log('getItems => Products', products)

      setProductList(products)

      // this.requestPurchase(itemSkus[0])
    } catch (err) {

      console.log('getItems || purchase error => ', err)
    }
  }

  const getSubscriptions = async () => {

    try {

      const products = await RNIap.getSubscriptions(itemSubs)

      console.log('Products => ', products)

      alert(JSON.stringify(products[0]))

      setProductList(products)

    } catch (err) {
      console.log('getSubscriptions error => ', err)
    }
  }

  const getAvailablePurchases = async () => {

    try {

      const purchases = await RNIap.getAvailablePurchases()
      console.info('Available purchases => ', purchases)
      
      alert(purchases)

      if (purchases && purchases.length > 0) {
        setAvailableItemsMessage(`Got ${purchases.length} items.`)
        setReceipt(purchases[0].transactionReceipt)
       
      }

    } catch (err) {
      console.warn(err.code, err.message)
      console.log('getAvailablePurchases error => ', err)
    }
  }

  const requestPurchase = async (sku) => {

    try {

      RNIap.requestPurchase(sku)

    } catch (err) {
      console.log('requestPurchase error => ', err)
    }

  }
  const requestSubscription = async (sku) => {
    try {
      // await getSubscriptions()
      await RNIap.requestSubscription(sku)
    } catch (err) {
      alert(err.toLocaleString())
    }
  }

  const purchaseConfirmed = () => {

    alert('payment successuful!!')

    //you can code here for what changes you want to do in db on purchase successfull

  }

  return (
    <SafeAreaView style={styles.rootContainer}>

      <Text style={{ marginTop: 30, fontSize: 30 }}>RNApplePay</Text>

      <TouchableOpacity
        onPress={() => getItems() }
        style={styles.buttonStyle}>
        <Text style={styles.buttonText}>Listar Produtos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => getSubscriptions()}
        style={styles.buttonStyle}>
        <Text style={styles.buttonText}>Listar Incrições</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => getAvailablePurchases()}
        style={styles.buttonStyle}>
        <Text style={styles.buttonText}>Compras disponíveis</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => requestPurchase(itemSubs[0])}
        style={styles.buttonStyle}>
        <Text style={styles.buttonText}>Comprar Produto</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => requestSubscription(itemSubs[0])}
        style={styles.buttonStyle}>
        <Text style={styles.buttonText}>Comprar Incrições</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 30 }}>By Rosival de Souza</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    width: '70%',
    height: 50,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
})