import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {
  const [isPending, setIsPending] = useState(true);
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [totalWaves, setTotalWaves] = useState(0);
  const [text, setText] = useState("");

  const contractAddress = "0xA56602D1Ac8AbA11d58761471B8D4D6CAE87D0Ea";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

    const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try{
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI,signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("we have recieved the wave count :",count.toNumber());
        setTotalWaves(count.toNumber()+1);

        //wave no.n
        const waveTxn = await wavePortalContract.wave(text);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());


      }else{
        console.log("ethereum object doesnt exist!!!");
      }
    }catch(error){
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // const waves = await wavePortalContract.getAllWaves();
        wavePortalContract.getAllWaves()
        .then(waves=>{
          let wavesCleaned = [];
          waves.forEach(wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message,
              waveNo: wave.waveNo,
            });
          });
          console.log("waves cleaned:", wavesCleaned);


        // was getting a error for object as react child so added []
        setAllWaves([wavesCleaned]);
        // printing all waves
        console.log("displaying all waves:",allWaves);
        setIsPending(false);
        })

      }else{
        console.log("ethereum object does not exist");
      }
    }catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();

  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Hey guys!!!
        </div>

        <div className="bio">
        Shrinath here. I am a Web developer and Curious about Block-chain development. Podcaster who talks about taboo.
        Have a AWESOME DAY 
        </div>
        <textarea value={text} id="message" name="message" row="4" column="50" placeholder="Type something and wave..." onChange={(e)=>setText(e.target.value)}></textarea>
        <button className="waveButton" onClick={()=>
        {
          wave();
          getAllWaves();
        }
        }>
          Wave BRUH?
        </button>
        
        {totalWaves && <p className="bio">Till now there are {totalWaves} waves including you</p>}

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect your Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          console.log(wave);
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Wave No.: {wave.waveNo}</div>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

