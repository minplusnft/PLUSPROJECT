import './App.css';
import { Button, ButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import 'sf-font';
import axios from 'axios';
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import TOKENABI from './TOKENABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, polygonscanapi, moralisapi } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';

var account = null;
var contract = null;
var vaultcontract = null;
var web3 = null;


const moralisapikey = "I9C9O9cGNYGLjXcJpBGCmQGkSspKo3nmhnprIKHhBItL2PK5ee3mb4kcm8iSLSHF";
const polygonscanapikey = "N6T3SSDAWWEBDHP2VR2424B3Z51UFGRVVI";

const providerOptions = {
  binancechainwallet: {
    package: true
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "3cf2d8833a2143b795b7796087fff369"
    }
  },
  walletlink: {
    package: WalletLink,
    options: {
      appName: "Net2Dev NFT Minter",
      infuraId: "3cf2d8833a2143b795b7796087fff369",
      rpc: "",
      chainId: 4,
      appLogoUrl: null,
      darkMode: true
    }
  },
};

const web3Modal = new Web3Modal({
  network: "rinkeby",
  theme: "dark",
  cacheProvider: true,
  providerOptions
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      balance: [],
      rawearn: [],
    };
  }

  handleModal() {
    this.setState({ show: !this.state.show })
  }

  handleNFT(nftamount) {
    this.setState({ outvalue: nftamount.target.value });
  }

  async componentDidMount() {

    await axios.get((polygonscanapi + `?module=stats&action=tokensupply&contractaddress=${NFTCONTRACT}&apikey=${polygonscanapikey}`))
      .then(outputa => {
        this.setState({
          balance: outputa.data
        })
        console.log(outputa.data)
      })
    let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
    await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=mumbai&format=decimal`), { headers: config })
      .then(outputb => {
        const { result } = outputb.data
        this.setState({
          nftdata: result
        })
        console.log(outputb.data)
      })
  }


  render() {
    const { balance } = this.state;
    const { outvalue } = this.state;


    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    const expectedBlockTime = 10000;

    async function connectwallet() {
      var provider = await web3Modal.connect();
      web3 = new Web3(provider);
      await provider.send('eth_requestAccounts');
      var accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById('wallet-address').textContent = account;
      contract = new web3.eth.Contract(ABI, NFTCONTRACT);
      vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
      var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
      document.getElementById('yournfts').textContent = getstakednfts;
      var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
      document.getElementById('stakedbalance').textContent = getbalance;
      const arraynft = Array.from(getstakednfts.map(Number));
      const tokenid = arraynft.filter(Number);
      var rwdArray = [];
      tokenid.forEach(async (id) => {
        var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
        var array = Array.from(rawearn.map(Number));
        console.log(array);
        array.forEach(async (item) => {
          var earned = String(item).split(",")[0];
          var earnedrwd = Web3.utils.fromWei(earned);
          var rewardx = Number(earnedrwd).toFixed(2);
          var numrwd = Number(rewardx);
          console.log(numrwd);
          rwdArray.push(numrwd);
        });
      });
      function delay() {
        return new Promise(resolve => setTimeout(resolve, 300));
      }
      async function delayedLog(item) {
        await delay();
        var sum = item.reduce((a, b) => a + b, 0);
        var formatsum = Number(sum).toFixed(2);
        document.getElementById('earned').textContent = formatsum;
      }
      async function processArray(rwdArray) {
        for (const item of rwdArray) {
          await delayedLog(item);
        }
      }
      return processArray([rwdArray]);
    }

    async function verify() {
      var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
      document.getElementById('yournfts').textContent = getstakednfts;
      var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
      document.getElementById('stakedbalance').textContent = getbalance;
    }

    async function enable() {
      contract.methods.setApprovalForAll(STAKINGCONTRACT, true).send({ from: account });
    }
    async function rewardinfo() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);
      var rwdArray = [];
      tokenid.forEach(async (id) => {
        var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
        var array = Array.from(rawearn.map(Number));
        array.forEach(async (item) => {
          var earned = String(item).split(",")[0];
          var earnedrwd = Web3.utils.fromWei(earned);
          var rewardx = Number(earnedrwd).toFixed(2);
          var numrwd = Number(rewardx);
          rwdArray.push(numrwd)
        });
      });
      function delay() {
        return new Promise(resolve => setTimeout(resolve, 300));
      }
      async function delayedLog(item) {
        await delay();
        var sum = item.reduce((a, b) => a + b, 0);
        var formatsum = Number(sum).toFixed(2);
        document.getElementById('earned').textContent = formatsum;
      }
      async function processArray(rwdArray) {
        for (const item of rwdArray) {
          await delayedLog(item);
        }
      }
      return processArray([rwdArray]);
    }
    async function claimit() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);

      tokenid.forEach(async (id) => {
        await vaultcontract.methods.claim([id])
          .send({
            from: account,

          })
      })

    }
    async function unstakeall() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);

      tokenid.forEach(async (id) => {
        await vaultcontract.methods.unstake([id])
          .send({
            from: account,

          })
      })

    }
    async function mint() {
      var _mintAmount = Number(outvalue);
      var mintRate = Number(await contract.methods.cost().call());
      var totalAmount = mintRate * _mintAmount;

      contract.methods.mint(account, _mintAmount)
        .send({
          from: account,
          value: String(totalAmount),
        });

    }

    async function mint0() {
      var _pid = "0";
      var erc20address = await contract.methods.getCryptotoken(_pid).call();
      var currency = new web3.eth.Contract(TOKENABI, erc20address);
      var mintRate = await contract.methods.getNFTCost(_pid).call();
      var _mintAmount = Number(outvalue);
      var totalAmount = mintRate * _mintAmount;

      currency.methods.approve(NFTCONTRACT, String(totalAmount))
        .send({
          from: account
        })
        .then(currency.methods.transfer(NFTCONTRACT, String(totalAmount))
          .send({
            from: account,

          },
            async function (error, transactionHash) {
              console.log("Transfer Submitted, Hash: ", transactionHash)
              let transactionReceipt = null
              while (transactionReceipt == null) {
                transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
                await sleep(expectedBlockTime)
              }
              window.console = {
                log: function (str) {
                  var out = document.createElement("div");
                  out.appendChild(document.createTextNode(str));
                  document.getElementById("txout").appendChild(out);
                }
              }
              console.log("Transfer Complete", transactionReceipt);
              contract.methods.mintpid(account, _mintAmount, _pid)
                .send({
                  from: account,

                });
            }));

    }
    const refreshPage = () => {
      window.location.reload();
    }

    return (
      <div className="App nftapp" style={{ background: "#333333", margin: "auto" }}>

        <div class="card" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", boxShadow: "1px 1px 10px #000000", }}>
          <label for="floatingInput" style={{ backgroundColor: "#ffffff10", marginTop: "auto", marginBottom: "auto", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >. MPN WEB3 PORTAL - MINT STAKE CLAIM TRADE AND MORE .</label>
        </div>
        
        <div className="row">
                  <div className="col ">

                    <Button className="btn" href="https://opensea.io/" style={{ margin: "5px", border: "2px", marginTop: "15px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >OPENSEA</Button>
                    <Button className="btn" href="https://quickswap.exchange/" style={{ margin: "5px", border: "2px", marginTop: "15px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >QUICKSWAP</Button>
                    <Button className="btn" href="https://twitter.com/MinerPlusNFT/" style={{ margin: "5px", border: "2px", marginTop: "15px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >TWITTER</Button>
                    <Button className="btn" href="https://discord.com/" style={{ margin: "5px", border: "2px", marginTop: "15px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >DISCORD</Button>

                  </div></div>

        <div className='container' style={{ background: "transparent", marginTop: "10px", border: "0", }}>

          <div class="card nftminter" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "auto", marginBottom: "7px", }}>
            <label for="floatingInput" style={{ marginTop: "auto", marginBottom: "auto", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >MPN MINT PORTAL</label>
          </div>

          <div className='coli'>
            <body className='nftminter' style={{ background: "transparent", marginTop: "auto", border: "0", }}>
              <form>
                <div className="row pt-3">
                  <div>
                    <Button className="btn" onClick={connectwallet} style={{ marginBottom: "20px", backgroundColor: "#ffffff10", border: " 2px", boxShadow: "1px 1px 5px #000000" }} >Connect Your Wallet</Button>
                  </div>

                  <h3>{balance.result}/1000</h3>

                  <div id='wallet-address' style={{ marginTop: "10px", fontWeight: "300", fontSize: "18px" }}>
                    <label style={{ marginTop: "auto", fontWeight: "300", fontSize: "18px" }}><h6>Your Wallet Address</h6></label>
                  </div>
                </div>
                <div>
                  <label style={{ marginTop: "20px", fontWeight: "300", fontSize: "18px" }}>Select Quantity</label>
                </div>
                <ButtonGroup size="lg"
                  aria-label="First group"
                  name="amount"
                  onClick={nftamount => this.handleNFT(nftamount, "value")} >
                  <Button style={{ marginBottom: "auto", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000", border: "2px" }} value="1">1</Button>
                  <Button style={{ marginBottom: "auto", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000", border: "2px" }} value="2">2</Button>
                  <Button style={{ marginBottom: "auto", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000", border: "2px" }} value="3">3</Button>
                  <Button style={{ marginBottom: "auto", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000", border: "2px" }} value="4">4</Button>
                  <Button style={{ marginBottom: "auto", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000", border: "2px" }} value="5">5</Button>
                </ButtonGroup>
                <div className="row px-2 pb-2 row-style">
                  <div className="col ">

                    <Button className="btn" onClick={mint} style={{ margin: "5px", border: "2px", marginTop: "15px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >MINT WITH MATIC</Button>
                    <Button className="btn" onClick={mint0} style={{ margin: "5px", border: "2px", marginTop: "15px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >MINT WITH PLUS</Button>

                  </div><div>
                    <label id='txout' style={{ marginTop: "auto", fontWeight: "300", fontSize: "12px" }}>status</label>
                  </div>
                </div>
              </form>
            </body>
          </div>

          <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "7px", }}>
            <label for="floatingInput" style={{ marginTop: "auto", marginBottom: "auto", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >MPN STAKE PORTAL</label>
          </div>
          <div className='coli'>

            <body className='nftstaker' style={{ background: "transparent", marginTop: "auto", border: "0", }}>

              <form style={{ fontFamily: "SF Pro Display" }} >
                <div className="row px-3">
                  <div>
                    <Button className="btn" onClick={enable} style={{ marginTop: "15px", border: "2px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Approve Your Wallet To Start Stake</Button>
                  </div>

                  <div className="col nftstaker" style={{ border: "0", background: "transparent", borderRadius: "5px", marginTop: "20px", marginBottom: "auto", }}>

                    <form class="stakingrewards" >

                      <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "7px", }}>
                        <label for="floatingInput" type="button" onClick={verify} style={{ marginTop: "1px", marginBottom: "-1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >CHECK YOUR VAULT</label>
                      </div>

                      <table className='table mb-3' style={{ border: "0", borderRadius: "5px", marginTop: "20px", marginBottom: "7px", }}>


                        <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>
                          <tr>
                            <label for="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >YOUR MPN STAKED ID

                              <div class="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>

                                <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='yournfts'></span></div></label>
                          </tr></div><div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px" }}>
                          <tr>
                            <label for="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >YOUR MPN STAKED TOTAL

                              <div class="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>

                                <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='stakedbalance'></span></div></label>
                          </tr></div><div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "7px", }}>
                          <label for="floatingInput" type="button" onClick={unstakeall} style={{ marginTop: "1px", marginBottom: "-1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >UNSTAKED ALL</label>
                        </div></table>
                    </form>
                  </div>

                  <div className="col nftstaker" style={{ border: "0", background: "transparent", borderRadius: "5px", marginTop: "20px", marginLeft: "20px", marginBottom: "20px" }}>
                    <form class="stakingrewards" >
                      <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "7px", }}>
                        <label for="floatingInput" type="button" onClick={rewardinfo} style={{ marginTop: "1px", marginBottom: "-1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >CHECK YOUR REWARDS</label>
                      </div>
                      <table className='table mb-3' style={{ border: "0", borderRadius: "5px", marginTop: "20px", marginBottom: "7px", }}>

                        <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>
                          <tr>
                            <label for="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >YOUR TOKEN REWARDS

                              <div class="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>

                                <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='earned'></span></div></label>
                          </tr></div>

                        <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px" }}>
                          <tr>
                            <label for="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >NICE DAYS

                              <div class="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>



                              <img className="card-img-top" src='mpn.png'alt="MPN PROJECT" />

                    
                        


                                </div></label>
                          </tr></div>

                        <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "7px", }}>
                          <label for="floatingInput" type="button" onClick={claimit} style={{ marginTop: "1px", marginBottom: "-1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >CLAIM ALL REWARDS</label>
                        </div></table></form></div></div></form></body> </div>
          <div class="card nftstaker" style={{ borderBottom: "0px", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "0", }}>
            <label for="floatingInput" type="button" onClick={refreshPage} style={{ marginTop: "1px", marginBottom: "1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >YOUR MPN PORTAL</label>
          </div></div><div className='container' style={{ background: "transparent", marginTop: "auto", border: "0", }}></div></div>
    )
  }
}
export default App;

