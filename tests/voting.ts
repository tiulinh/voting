import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { assert } from 'chai';
// import { systemProgramErrors } from './system-errors';
const web3 = anchor.web3;
describe("voting", () => {
  // Configure the client to use the local cluster.
  const provider= anchor.AnchorProvider.env();
  anchor.setProvider(provider);

 const program = anchor.workspace.Voting as Program<Voting>;
 const admin= (provider.wallet as anchor.Wallet).payer;
 const voter= web3.Keypair.generate();
 const poll_id=new anchor.BN(1);
 console.log("Admin address: ", admin.publicKey.toBase58());
 before("Airdrop for candiate ",async()=>{
   const tx= await provider.connection.requestAirdrop(voter.publicKey,10*10**9);
    await provider.connection.confirmTransaction(tx)
    const balance=await provider.connection.getBalance(voter.publicKey);
    const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSOL);
    console.log(`${voter.publicKey.toBase58()}: ${formattedBalance} SOL`);
    
 })
  it.skip("Initialize poll!", async () => {
    const [pollAddress] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), poll_id.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    console.log("Address poll: ",pollAddress.toBase58());
    
    const tx = await program.methods.initializePoll(
      poll_id,
      new anchor.BN(0),
      new anchor.BN(1759508293),
      "Test poll",
      "description",
  )
    .rpc();
    console.log('Your transaction signature', tx);
    const data=await program.account.pollAccount.fetch(pollAddress);

    console.log("Data poll: ",data)
  });

  it.skip("Initialize candiate",async()=>{
    const [pollAddress]=web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll"),poll_id.toArrayLike(Buffer,"le",8)],
      program.programId
    );
  // const tx= await program.methods.initializeCandidate(poll_id,"Darvis")
    
    const tx= await program.methods.initializeCandidate(poll_id,"Hồ Linh")
    .rpc();
     console.log("Your transaction signature: ",tx);

     const data=await program.account.pollAccount.fetch(pollAddress);
     console.log("Data poll: ",data);
  });

  it("Vote ",async()=>{
    const tx = await program.methods.vote(
      poll_id,
      "Darvis",
    )
    .rpc();

    console.log('Your transaction signature', tx);

    const [datavote] = web3.PublicKey.findProgramAddressSync(
      [poll_id.toArrayLike(Buffer, "le", 8), Buffer.from("Darvis")],
      program.programId
    );
    const data=await program.account.candidateAccount.fetch(datavote);
    console.log("Voted: ",data)

  })
  
 

});
