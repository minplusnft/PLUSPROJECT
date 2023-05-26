import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useEffect, useState } from 'react'
import 'sf-font';
import axios from 'axios';
import VAULTABI from './VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, moralisapi, nftpng } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';

var web3 = null;
var account = null;
var vaultcontract = null;

const moralisapikey = "I9C9O9cGNYGLjXcJpBGCmQGkSspKo3nmhnprIKHhBItL2PK5ee3mb4kcm8iSLSHF";
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
export default function NFT() {
  const [apicall, getNfts] = useState([])
  const [nftstk, getStk] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    callApi()
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [])

  async function callApi() {
    var provider = await web3Modal.connect();
    web3 = new Web3(provider);
    await provider.send('eth_requestAccounts');
    var accounts = await web3.eth.getAccounts();
    account = accounts[0];
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
    let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
    const nfts = await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=mumbai&format=decimal`), { headers: config })
      .then(output => {
        const { result } = output.data
        return result;
      })
    const apicall = await Promise.all(nfts.map(async i => {
      let item = {
        tokenId: i.token_id,
        holder: i.owner_of,
        wallet: account,
      }
      return item
    }))
    const stakednfts = await vaultcontract.methods.tokensOfOwner(account).call()
      .then(id => {
        return id;
      })
    const nftstk = await Promise.all(stakednfts.map(async i => {
      let stkid = {
        tokenId: i,
      }
      return stkid
    }))
    getNfts(apicall)
    getStk(nftstk)
    console.log(apicall);
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !apicall.length)
    return (
      <h1 className="text-3xl">Wallet Not Connected</h1>)
  return (
    <div className="App" style={{ background: "#333333", margin: "auto" }}>
      <div className='container' style={{ background: "transparent", marginTop: "auto", border: "0", }}>
        <div class="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "auto", marginBottom: "auto", }}>


          <div className="card" style={{ background: "transparent", marginTop: "auto", border: "0", }}>
            <div className="ml-3 mr-3" style={{ display: "inline-grid", gridTemplateColumns: "repeat(4, 5fr)", columnGap: "auto" }}>

              {apicall.map((nft, i) => {
                var owner = nft.wallet.toLowerCase();
                if (owner.indexOf(nft.holder) !== -1) {

                  async function stakeit() {
                    vaultcontract.methods.stake([nft.tokenId]).send({ from: account });
                  }

                  return (

                    <div className="card mt-3" style={{ background: "transparent", marginRight: "10px", marginLeft: "10px", marginTop: "10px", boxShadow: "1px 1px 10px #000000", }} key={i} >
                      <div className="image-over">
                        <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="MPN PROJECT" />

                        <div className="card-body">
                          <div class="card" style={{ background: "transparent", marginTop: "auto", boxShadow: "1px 1px 10px #000000", }}>
                            <input key={i} type="hidden" id='stakeid' value={nft.tokenId} />
                            <Button for="floatingInput" style={{ background: "transparent", marginTop: "auto", border: "2px", marginBottom: "auto", color: "#fff", fontSize: "7px" }} onClick={stakeit}>STAKE</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                  )
                }
              }
              )}
            </div></div>
          <div className="card " style={{ background: "transparent", marginTop: "auto", border: "0", }}>
            <div className="ml-3 mr-3" style={{ display: "inline-grid", gridTemplateColumns: "repeat(4, 5fr)", columnGap: "auto" }}>

              {nftstk.map((nft, i) => {
                async function unstakeit() {
                  vaultcontract.methods.unstake([nft.tokenId]).send({ from: account });
                }
                return (




                  <div className="card mt-3" style={{ background: "#800000", marginBottom: "20px", marginRight: "10px", marginLeft: "10px", marginTop: "10px", boxShadow: "1px 1px 10px #000000", }} key={i} >
                    <div className="image-over">
                      <img style={{ position: 'absolute', top: '0.1rem', width: '60px' }} src='stamp.png' alt='MPN PROJECT'></img>
                      <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="MPN PROJECT" />

                      <div className="card-body">
                        <div class="card" style={{ background: "#000000", marginTop: "auto", boxShadow: "1px 1px 10px #000000", }}>

                          <input key={i} type="hidden" id='nftstk' value={nft.tokenId} />
                          <Button style={{ background: "transparent", marginTop: "auto", border: "2px", marginBottom: "auto", color: "#fff", fontSize: "7px" }} onClick={unstakeit}>UNSTAKE</Button>

                        </div>
                      </div>
                    </div>
                  </div>


                )
              })}













            </div></div>


          <div class="header">
            <div class="card nftminter" style={{ border: "0", borderRadius: "5px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>

              <div class="card nftminter" style={{ border: "0", borderRadius: "5px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>

                <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "300" }}>MPN STAKINGS POOLS REWARDS</div>
              </div>


              <table className='table table-bordered table-dark' style={{ borderRadius: '0px', marginBottom: "0px" }} >

                <thead className='thead-light'>
                  <tr>
                    <th scope="col">MPN COLLECTION RARITY</th>
                    <th scope="col">DAILY & MONTHLY REWARDS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>BRONZE MPN</td>
                    <td class="amount" data-test-id="rewards-summary-ads">
                      <span class="amount"></span>&nbsp;<span class="currency">0.5 PLUS / D or 15 PLUS / M</span>
                    </td>
                  </tr>
                  <tr>
                    <td>SILVER MPN</td>
                    <td class="amount" data-test-id="rewards-summary-ac">
                      <span class="amount"></span>&nbsp;<span class="currency">0.9 PLUS / D or 27 PLUS / M</span>
                    </td>
                  </tr>
                  <tr>
                    <td>GOLD MPN</td>
                    <td class="amount" data-test-id="rewards-summary-ac">
                      <span class="amount"></span>&nbsp;<span class="currency">1.5 PLUS / D or 45 PLUS / M</span>
                    </td>
                  </tr>
                  <tr>
                    <td>DIAMOND MPN</td>
                    <td class="amount" data-test-id="rewards-summary-ac">
                      <span class="amount"></span>&nbsp;<span class="currency">3.5 PLUS / D or 105 PLUS / M</span>
                    </td>
                  </tr>
                </tbody>
              </table>


              <div class="card nftminter" style={{ border: "0", borderRadius: "5px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>

                <div class="card nftminter" style={{ border: "0", borderRadius: "5px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>

                  <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "300" }}>GOLD AND DIAMOND HODL REWARDS</div>
                </div>


                <table className='table table-bordered table-dark' style={{ borderRadius: '0px', marginBottom: "0px" }} >

                  <thead className='thead-light'>
                    <tr>
                      <th scope="col">MONTHLY NO LIST / TRSNSFER</th>
                      <th scope="col">REWARDS GUARANTED</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ONE GOLD MPN</td>
                      <td class="amount" data-test-id="rewards-summary-ads">
                        <span class="amount"></span>&nbsp;<span class="currency">105 USDT - MAX 510 USDT</span>
                      </td>
                    </tr>
                    <tr>
                      <td>ONE DIAMOND MPN</td>
                      <td class="amount" data-test-id="rewards-summary-ac">
                        <span class="amount"></span>&nbsp;<span class="currency">150 USDT - NO MAX INCREASE</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="card nftstaker" style={{ borderBottom: "0px", borderRadius: "5px", background: "#ffffff10", marginTop: "20px", marginBottom: "0", }}>
            <label for="floatingInput" type="button" onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }} style={{ marginTop: "1px", marginBottom: "-1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >BACK TO TOP</label>
          </div>
        </div>

      </div>

      <div class="card" style={{ background: "transparent", marginTop: "20px", boxShadow: "1px 1px 10px #000000", }}>
        <label for="floatingInput" style={{ backgroundColor: "#ffffff10", marginTop: "auto", marginBottom: "auto", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >MPN PROJECT © 2023</label>
      </div>

    </div>


  )
}
