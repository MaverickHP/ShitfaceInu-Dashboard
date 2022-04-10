import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Layout from 'layouts'
import CreatePool from 'pages/CreatePool'
import Farm from 'pages/CreatePool/Farm';
import Pool from 'pages/Pool';
import './App.css';
import { useEffect, useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  gql
} from "@apollo/client";
import ConnectModal from './components/ConnectModal';
import useAuth from 'hooks/useAuth';
import Tracker from 'pages/Tracker';
import { Shitface_ADDR, Shitface_Tracker_ADDR, Shitface_BNB_ADDR, Manual_Lock, First_Lock, Second_Lock } from 'abis/address';
import ShitFaceInu from 'abis/ShitFaceInu.json';
import ShitFaceInuTracker from 'abis/ShitFaceInuTracker.json';
import PancakePairABI from 'abis/PancakePairABI.json';
import ERC20ABI from 'abis/ERC20ABI.json';
import ManualABI from 'abis/ManualABI.json';
import LockABI from 'abis/LockABI.json';
import axios from 'axios';



const client = new ApolloClient({

  link: new HttpLink({
    uri: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2',
  }),
  cache: new InMemoryCache()
})

const TOKEN_DAILY_DATA = gql`
  query tokenDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    tokenDayDatas(    
      first: 1000    
      skip: $skip    
      where: {token: $address, date_gt: $startTime}    
      orderBy: date    
      orderDirection: asc  
    ) 
    {    
      date    
      dailyVolumeUSD    
      totalLiquidityUSD   
      priceUSD 
     
    }
  }
`
declare let window: any;

let trackerid: any = null, txid: any = null, poolid: any = null;
const App = () => {
  const [isOpen, setOpen] = useState(false);
  const { login, logout } = useAuth()
  const [account, setAccount] = useState<any>(null);
  const [dividendInfo, setDividendInfo] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [withdrawn, setWithdrawn] = useState<any>(null);
  const [tokentxlist, setTokenTxList] = useState<any>(null);
  const [reserves, setReserves] = useState<any>(null);
  const [payouttxlist, setPayoutTxList] = useState<any>(null);
  const [tokenwholetxlist, setTokenWholeTxList] = useState<any>(null);

  const [manuallockdata, setManualLockData] = useState({});
  const [firstlockdata, setFirstLockData] = useState({});
  const [secondlockdata, setSecondLockData] = useState({});

  async function fetchTrackerData() {
    const trackerContract = new window.web3.eth.Contract(ShitFaceInuTracker, Shitface_Tracker_ADDR);
    let _dividendInfo = { lastClaimTime: new Date().getTime() / 1000 }, _withdrawn = '0';
    if (account) {
      _dividendInfo = await trackerContract.methods.getAccount(account).call();
      _withdrawn = (await trackerContract.methods.withdrawnDividendOf(account).call() / Math.pow(10, 18)).toString();
    }
    setDividendInfo(_dividendInfo);
    setWithdrawn(_withdrawn);
  }

  async function fetchTokenInfo() {
    const tokenContract = new window.web3.eth.Contract(ERC20ABI, Shitface_ADDR);
    const totalSupply = await tokenContract.methods.totalSupply().call() / Math.pow(10, 18);
    let balance: any = '0';
    if (account)
      balance = (await tokenContract.methods.balanceOf(account).call() / Math.pow(10, 18)).toString()
    const price = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${Shitface_ADDR}`);
    setTokenInfo({ name: 'ShitFace Inu', decimal: 18, symbol: 'SFINU', price: price.data.data, totalSupply, balance });
  }

  async function fetchLiquidityInfo() {
    const pairContract = new window.web3.eth.Contract(PancakePairABI, Shitface_BNB_ADDR);
    let reserves = await pairContract.methods.getReserves().call();
    reserves._reserve0 = (reserves._reserve0 / Math.pow(10, 18)).toString();
    reserves._reserve1 = (reserves._reserve1 / Math.pow(10, 18)).toString();
    setReserves(reserves);
  }
  async function fetchTokenTotalInfo() {
    try {
      let txlist: any = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&address=${Shitface_BNB_ADDR}&contractaddress=${Shitface_ADDR}&page=1&offset=100&sort=desc&apikey=HQ1F33DXXJGEF74NKMDNI7P8ASS4BHIJND`);
      txlist = txlist.data.result;
      console.log("txlist", txlist);

      setTokenTxList(txlist);
      await fetchPayoutTxList();

    }
    catch (error) {
      console.log(error);
    }
  }
  async function fetchTokenWholeData() {
    let txlist: any = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&address=${Shitface_BNB_ADDR}&contractaddress=${Shitface_ADDR}&page=1&offset=10000&sort=desc&apikey=HQ1F33DXXJGEF74NKMDNI7P8ASS4BHIJND`);
    txlist = txlist.data.result;
    setTokenWholeTxList(txlist);
    console.log("wholelist", txlist);
  }
  async function fetchPayoutTxList() {
    try {
      let txlist: any = await axios.get(`https://api.bscscan.com/api?module=account&action=txlist&address=${Shitface_ADDR}&contractAddress=${Shitface_ADDR}&page=1&offset=300&sort=desc&apikey=HQ1F33DXXJGEF74NKMDNI7P8ASS4BHIJND`);
      txlist = txlist.data.result;
      let temp = [];
      for (let i = 0; i < txlist.length; i++) {
        if (!txlist[i].input) continue;
        if (txlist[i].input.includes('0x4e71d92d'))
          temp.push(txlist[i]);
      }
      console.log("payoutlist", txlist);
      setPayoutTxList(temp);
    } catch (error) {
      console.log(error);
    }
  }
  async function fetchPoolData(address: string) {
    if (address === Manual_Lock) {
      const ManualContract = new window.web3.eth.Contract(ManualABI, address);
      const duration = "UNLOCKED";
      const depositFee = (await ManualContract.methods.depositFee().call() / 100).toString();
      const withdrawFee = (await ManualContract.methods.withdrawFee().call() / 100).toString();
      let stakingAmount = '0.00000', pendingReward = '0.00000', pendingReflection = '0.00000', allowance = '0';
      if (account) {
        pendingReward = (await ManualContract.methods.pendingReward(account).call() / Math.pow(10, 18)).toString();

        pendingReflection = Number(await ManualContract.methods.pendingDividends(account).call() / Math.pow(10, 18)).toString();

        const userinfo = await ManualContract.methods.userInfo(account).call();
        stakingAmount = Number(userinfo.amount / Math.pow(10, 18)).toString();

        const tokenContract = new window.web3.eth.Contract(ERC20ABI, Shitface_ADDR);
        allowance = await tokenContract.methods.allowance(account, address).call();
      }

      const rewardPerBlock = await ManualContract.methods.rewardPerBlock().call();
      let totalStaked: any = await ManualContract.methods.totalStaked().call();
      const rate = Number(rewardPerBlock / totalStaked * 36500 * 28800).toFixed(2);
      const bonusEndBlock = await ManualContract.methods.bonusEndBlock().call();
      const lastRewardBlock = await ManualContract.methods.lastRewardBlock().call();
      const performanceFee = await ManualContract.methods.performanceFee().call();
      totalStaked = numberWithCommas((totalStaked / Math.pow(10, 18)).toFixed(0));

      setManualLockData({
        address,
        allowance,
        duration,
        depositFee,
        withdrawFee,
        pendingReward,
        pendingReflection,
        stakingAmount,
        rate,
        totalStaked,
        endsIn: numberWithCommas((bonusEndBlock - lastRewardBlock).toString()),
        locked: '0',
        performanceFee
      })
    }
    else {
      const lockContract = new window.web3.eth.Contract(LockABI, address);
      const lockupInfo = await lockContract.methods.lockupInfo().call();
      let stakingAmount = '0.00000', pendingReward = '0.00000', pendingReflection = '0.00000', allowance = 0, locked = '0';
      if (account) {
        pendingReward = Number(await lockContract.methods.pendingReward(account).call() / Math.pow(10, 18)).toString();

        pendingReflection = Number(await lockContract.methods.pendingDividends(account).call() / Math.pow(10, 18)).toString();

        const userinfo = await lockContract.methods.userInfo(account).call();
        stakingAmount = Number(userinfo.amount / Math.pow(10, 18)).toString();

        const tokenContract = new window.web3.eth.Contract(ERC20ABI, Shitface_ADDR);
        allowance = await tokenContract.methods.allowance(account, address).call();

        locked = (userinfo.locked / Math.pow(10, 18)).toFixed(0);
      }
      const performanceFee = await lockContract.methods.performanceFee().call();
      const rate = Number(lockupInfo.rate / lockupInfo.totalStaked * 36500 * 28800).toFixed(2);
      const bonusEndBlock = await lockContract.methods.bonusEndBlock().call();
      if (address === First_Lock)
        setFirstLockData({
          address,
          allowance,
          duration: lockupInfo.duration + ' Days',
          depositFee: (lockupInfo.depositFee / 100).toString(),
          withdrawFee: (lockupInfo.withdrawFee / 100).toString(),
          pendingReward,
          pendingReflection,
          stakingAmount,
          rate,
          totalStaked: numberWithCommas((lockupInfo.totalStaked / Math.pow(10, 18)).toFixed(0)),
          endsIn: numberWithCommas((bonusEndBlock - lockupInfo.lastRewardBlock).toString()),
          performanceFee,
          locked
        });
      else {
        setSecondLockData({
          address,
          allowance,
          duration: lockupInfo.duration + ' Days',
          depositFee: (lockupInfo.depositFee / 100).toString(),
          withdrawFee: (lockupInfo.withdrawFee / 100).toString(),
          pendingReward,
          pendingReflection,
          stakingAmount,
          rate,
          totalStaked: numberWithCommas((lockupInfo.totalStaked / Math.pow(10, 18)).toFixed(0)),
          endsIn: numberWithCommas((bonusEndBlock - lockupInfo.lastRewardBlock).toString()),
          performanceFee,
          locked
        })
      }
    }
  }
  function numberWithCommas(x: string) {
    if (!x) return '0';
    const list = x.split('.')
    if (list.length > 1)
      return list[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + list[1];
    return list[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  useEffect(() => {
    if (txid) {
      clearInterval(txid);
      fetchTokenTotalInfo();
    }
    txid = setInterval(function () {
      fetchTokenTotalInfo();
    }, 60000)
    if (trackerid) {
      clearInterval(trackerid);
      fetchTrackerData();
      fetchTokenInfo();
      fetchLiquidityInfo();
    }
    trackerid = setInterval(function () {
      fetchTrackerData();
      fetchTokenInfo();
      fetchLiquidityInfo();
    }, 10000)
    if (poolid) {
      clearInterval(poolid);
      fetchPoolData(Manual_Lock);
      fetchPoolData(First_Lock);
      fetchPoolData(Second_Lock);
    }
    poolid = setInterval(function () {
      fetchPoolData(Manual_Lock);
      fetchPoolData(First_Lock);
      fetchPoolData(Second_Lock);
    }, 10000)
  }, [account])

  useEffect(() => {
    if (!tokenwholetxlist || !tokenwholetxlist.length) {
      console.log("!!!!!!!!!");
      fetchTokenWholeData();
    }
    fetchTokenTotalInfo();
    fetchPoolData(Manual_Lock);
    fetchPoolData(First_Lock);
    fetchPoolData(Second_Lock);
    fetchTrackerData();
    fetchTokenInfo();
    fetchLiquidityInfo();
  }, [])
  return (
    <div className='App'>
      <ApolloProvider client={client}>
        <ConnectModal login={login} open={isOpen} setOpen={setOpen} account={account} setAccount={setAccount} />
        <Router>
          <Switch>
            <Layout account={account} setAccount={setAccount} open={isOpen} setOpen={setOpen}>
              <Route exact path='/'>
                <Tracker
                  account={account}
                  dividendInfo={dividendInfo}
                  tokenInfo={tokenInfo}
                  withdrawn={withdrawn}
                  tokentxlist={tokentxlist}
                  tokenwholetxlist={tokenwholetxlist}
                  reserves={reserves}
                  payouttxlist={payouttxlist}
                />
              </Route>
              <Route exact path='/pools'>
                <Pool
                  tokenInfo={tokenInfo}
                  account={account}
                  pooldatas={[manuallockdata, firstlockdata, secondlockdata]}
                  open={isOpen} setOpen={setOpen}
                />
              </Route>
            </Layout>
          </Switch>
        </Router>
      </ApolloProvider>
    </div>
  )
}

export default App