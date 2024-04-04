import styles from '@/styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount, useBalance, useContractRead } from 'wagmi'
import { NFTDevsDAOABI, NFTDevsDAOAddress, NFTDevsNFTABI, NFTDevsNFTAddress } from '@/constants'
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";
import Head from 'next/head'
import { formatEther } from 'viem'

export default function Home() {
  const [loading,setLoading] = useState(0)

  const [fakeNFTtokenId,setFakeNFTtokenId] = useState([])

  const {address,isConnected} = useAccount();

  const [isMounted, setIsMounted] = useState(false);
  
  const [proposals, setProposals] = useState([])

  const [selectedTab, setSlectedTab] = useState("")


  const DAOOwner = useContractRead({
    address : NFTDevsDAOAddress,
    abi : NFTDevsDAOABI,
    functionName : "owner"
  })

  const daoBalance = useBalance({
    address : NFTDevsDAOAddress
  })

  const numOfProposalsInDAO = useContractRead({
    address : NFTDevsDAOAddress,
    abi : NFTDevsDAOABI,
    functionName : "numProposals"
  })

  const userNFTBalannce = useContractRead({
    address : NFTDevsNFTAddress,
    abi : NFTDevsNFTABI,
    functionName : "balanceOf",
    args : [address]
  })


  async function createProposal(){
    setLoading(true)
    try {
      
      const tx = await writeContract({
        address : NFTDevsDAOAddress,
        abi : NFTDevsDAOABI,
        functionName : "createPoposal",
        args : [fakeNFTtokenId]
      })
      

      await waitForTransaction(tx)

      

    } catch (error) {
      console.log(error);
      window.alert(error)
    }
    setLoading(false)
  }

  async function executeProposal(proposalId){
    setLoading(true)
    try {
      
      const tx =await writeContract({
        address : NFTDevsDAOAddress,
        abi : NFTDevsDAOABI,
        functionName : "executeProposal",
        args : [proposalId]
      })

      await waitForTransaction(tx)

    } catch (error) {
      console.log(error);
      window.alert(error)
    }
    setLoading(false)
  }

  async function fetchAllProposals(){

    try {


      const proposals = []
      for(var i=0 ; i<numOfProposalsInDAO.data;i++){
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }

      setProposals(proposals)
      return proposals;
      
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchProposalById(proposalId){
      try {
        
        const proposal =await readContract({
          address : NFTDevsDAOAddress,
          abi : NFTDevsDAOABI,
          functionName : "proposals",
          args : [proposalId]
        })
        const [nftTokenId, deadline, yayVotes, nayVotes, executed] = proposal
        const parsedProposal = {
          proposalId : proposalId,
          nftTokenId : nftTokenId.toString(),
          deadline : new Date(parseInt(deadline.toString())*1000),
          yayVotes : yayVotes.toString(),
          nayVotes : nayVotes.toString(),
          executed : Boolean(executed)
        }
        return parsedProposal;

      } catch (error) {
        console.error(error);
      }
     
  }

  async function voteOnProposal(proposalId,vote){
    setLoading(true)
    try {
      
      const tx = await writeContract({
        address : NFTDevsDAOAddress,
        abi : NFTDevsDAOABI,
        functionName : "voteOnProposal",
        args : [proposalId,vote === "YAY"?0:1]
      })

      await waitForTransaction(tx)
      


    } catch (error) {
      console.error();
      window.alert(error)
    }

    setLoading(false)
  }

  async function withdrawDAOEther(){
    setLoading(true)
    try {

      const tx = await writeContract({
        address : NFTDevsDAOAddress,
        abi : NFTDevsDAOABI,
        functionName : "withdrawEther",
      })

      await waitForTransaction(tx);
      
    } catch (error) {
      console.error(error);
      window.alert(error)
    }
    setLoading(false)
  }

  function renderSelectedTabs(){
    if(selectedTab.toString()=== "View Proposals"){
      renderFetchProposalsTab()
    }else if(selectedTab === "Create Proposals"){
      renderCreateProposalsTab()
    }

    return null;
  }

  function renderFetchProposalsTab(){
    if(loading){
      return(
        <div className={styles.description}>
          loading...
        </div>
      )
    }else if(proposals.length==0){
      console.log(proposals);
      return(
        <div className={styles.description}>
          No proposals yet to Display
          
        </div>
      )
    }
    else{
      return(
        <div>
          {proposals.map((p,index)=>(
            <div key={index} className={styles.card}>
              <p>Proposal ID : {p.proposalId}</p>
              <p>NFT Token ID : {p.nftTokenId}</p>
              <p>Deadline : {p.deadline.toString()}</p>
              <p>YAY Votes : {p.yayVotes}</p>
              <p>NAY Votes : {p.nayVotes}</p>
              <p>Executed : {p.executed.toString()}</p>
              {p.deadline.getTime()>Date.now() && !p.executed ? (
                  <div className={styles.flex}>
                    <button className={styles.button} onClick={()=>voteOnProposal(p.proposalId,"YAY")}>YAY</button>
                    <button className={styles.button} onClick={()=>voteOnProposal(p.proposalId,"NAY")}>NAY</button>
                  </div>
                ) : p.deadline.getTime() < Date.now() && !p.executed ?(
                  <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
                ):(<div className={styles.description}>Proposal Executed</div>)
              }
            </div>
          ))}
        </div>
      )
    }

  }


  function renderCreateProposalsTab(){
      if(loading){
        return(
          <div className={styles.description}>
            loading...
          </div>
        )
      }
      else if(userNFTBalannce.data===0){
        return(
          <div className={styles.description}>
            You don't own any NFT's of our Organisation, you can't take part in this..
          </div>
        )
      }else{
        return(
        <div className={styles.container}>
          <label>Fake NFT TokenId to purchase:</label>
          <input placeholder='0' type='number' onChange={(e)=>setFakeNFTtokenId(e.target.value)} />
          <button className={styles.button} onClick={createProposal}>Create</button>
        </div>
        )
      }
      
  }



  useEffect(()=>{
    setIsMounted(true);
    setInterval(()=>{
      fetchAllProposals()
    },5*1000)

    // console.log(proposals.length);
  },[])


  // if(!isConnected){
  //   return(
  //     <div className={styles.nav}><ConnectButton/></div>

  //   )
  // }

  return (
    <>     
    <Head>
      <title>DAO-Decentraliized Autonomous Organisation</title>
      <meta name='description' content='NFT-Devs-DAO'/>
    </Head>
    <div className={styles.nav}><ConnectButton/></div>
    <div className={styles.main}>
        <div>
            <h1 className={styles.title}>NFT Devs-DAO</h1>
            <div className={styles.description}>Welcome to our DAO.!</div>
            {/* <div className={styles.description}>Your NFT Collection Balance : {userNFTBalannce.data.toString()}</div>
            <div className={styles.description}>Treasury Balance : {formatEther(daoBalance.data.value).toString()}ETH</div>
            <div className={styles.description}>Total number of Proposals : {numOfProposalsInDAO.data.toString()} </div>  */}
            <div className={styles.flex}>
                <button className={styles.button} onClick={()=>setSlectedTab("Create Proposals")}>Create Proposal</button>
                <button className={styles.button} onClick={()=>setSlectedTab("View Proposals")}>View Proposals</button>
            </div>
            {selectedTab==="Create Proposals"?renderCreateProposalsTab():null}
            {selectedTab==="View Proposals"?renderFetchProposalsTab():null}

            <div>
              {loading ? (
                <button className={styles.button}>loading...</button>
              ):(
                <button className={styles.button} onClick={withdrawDAOEther}>Withdraw DAO Ether</button>
              )}
            </div>
        </div>
    </div>
    </>
  )
}
