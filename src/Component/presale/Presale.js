import React, { useEffect, useRef, useState } from 'react'
import p305 from "../../Component/Assets/305 1.png"
import ProgressBar from 'react-bootstrap/ProgressBar'
import { loadWeb3 } from "../Apis/Api"
import "./presale.css"
import { toast } from 'react-toastify';
import { presaleContractAddress, presaleContractAbi } from "../Utils/PresaleContract"
import {usdtAbi, usdtAddress} from '../Utils/usdt';
import {inkoinAbi, inkoinAddress} from '../Utils/inkoin'
import Web3 from "web3";
const webSupply = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/");
function Presale() {
    let [btntext, setBtnTxt] = useState("Connect")
    let [enterBNB, setEnterBNB] = useState("0.00")
    let [price, setPreice] = useState(0)
    let [percentageValue, setpercentageValue] = useState(0)
    let [minimumPrice, setMinimumPrice] = useState(0)
    let [maximumPrice, setMaximumPrice] = useState(0)
    let [usdtBalance, setUsdtBalance] = useState(0)
    let [totalSupply, setToatlSupply]=useState(0)
    let [progress, setProgress]=useState(0)
    let userEnterBNB = useRef(0)
    const getaccount = async () => {
        let acc = await loadWeb3();
        if (acc == "No wallet") {
            setBtnTxt("No Wallet")
        } else if (acc == "Wrong Network") {
            setBtnTxt("Wrong Network")
        } else {
            let myAcc = acc?.substring(0, 3) + "..." + acc?.substring(acc?.length - 3);
            setBtnTxt(myAcc);
        }

    }
    const calculatedRoadPrice = async () => {
        try {
            
                const preSaleContractOf = new webSupply.eth.Contract(presaleContractAbi, presaleContractAddress);
                 
                let userenterVal = userEnterBNB.current.value
                if (parseFloat(userenterVal) > 0) {
                    let userentervaltoWei = webSupply.utils.toWei(userenterVal.toString())
                    let calculatedprice = await preSaleContractOf.methods.calculate_token(userentervaltoWei).call();
                    calculatedprice = webSupply.utils.fromWei(calculatedprice);
                    console.log("calculatedprice", calculatedprice);
                    setEnterBNB(calculatedprice);
                }
           
        } catch (e) {
            console.log("e", e);
        }

    }
    const getValueWithOutMetaMask = async () => {
        try{
            const  inKoinContract =new webSupply.eth.Contract(inkoinAbi, inkoinAddress);
            const preSaleContractOf = new webSupply.eth.Contract(presaleContractAbi, presaleContractAddress);
            let supply = await inKoinContract.methods.totalSupply().call();
            supply = webSupply.utils.fromWei(supply);
            setToatlSupply(parseFloat(supply))

            let totalSold = await preSaleContractOf.methods.totalSold().call();
            totalSold = webSupply.utils.fromWei(totalSold);
            setProgress(totalSold / supply);
            let priceValue = await preSaleContractOf.methods.price().call();
                priceValue = webSupply.utils.fromWei(priceValue)
                setPreice(priceValue)
                let minpice = await preSaleContractOf.methods.minimum().call();
                minpice = webSupply.utils.fromWei(minpice)
                setMinimumPrice(minpice);
                let maxprice = await preSaleContractOf.methods.maximum().call();
                maxprice = webSupply.utils.fromWei(maxprice)
                setMaximumPrice(maxprice)
        }catch(e){
            console.log("error while get value without metamask", e);
        }
    }
    const GetValue = async () => {
        try {
            let acc = await loadWeb3();
            if (acc == "No Wallet") {
                console.log("wallet");

            }
            else if (acc == "Wrong Network") {
                console.log("wrong network");
            }else {
                const web3 = window.web3;
                let preSaleContractOf = new web3.eth.Contract(presaleContractAbi, presaleContractAddress);
                const usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress);
                

                let bal = await usdtContract.methods.balanceOf(acc).call();
                bal = web3.utils.fromWei(bal)
                setUsdtBalance(bal)
            }
        } catch (e) {
            console.log("e", e);
        }


    }

    const buyUSTDwithInkoin = async () => {

        try {
            let acc = await loadWeb3();
            if (acc == "No Wallet") {
                console.log("wallet");
                toast.error("Connect Wallet")
            }
            else if (acc == "Wrong Network") {
                toast.error("Wrong Network")
            }else {
                let userenterVal = userEnterBNB.current.value;
                if(userenterVal > 0) {
                    if (parseFloat(userenterVal) >= 0.1 && parseFloat(userenterVal)<=12) {
                        const web3 = window.web3;
                        const usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress)
                        let usersBNBBalance = await usdtContract.methods.balanceOf(acc).call()
                        usersBNBBalance = web3.utils.fromWei(usersBNBBalance);

                        if(parseFloat(usersBNBBalance) >=parseFloat(userenterVal) ){
                            let userentervaltoWei = web3.utils.toWei(userenterVal.toString())

                        let preSaleContractOf = new web3.eth.Contract(presaleContractAbi, presaleContractAddress);

                        await usdtContract.methods.approve(presaleContractAddress, userentervaltoWei).send({
                            from:acc
                        })
                        await preSaleContractOf.methods.buy(userentervaltoWei).send({
                            from: acc
                        })
                        GetValue();
                        getValueWithOutMetaMask();
                        toast.success("Transaction confirmed")
                    }else{
                        toast.error("Incufficent fund")
                    }
                }else{
                    toast.error("Please put value above 0.1 and below 12")
                }

            }else{
                toast.error("Please put value")
            }
        }
        } catch (e) {
            console.log("e", e)
        }
    }

    useEffect(() => {
        getaccount()
        GetValue();
        getValueWithOutMetaMask()
        // calucaltePercentage();
    }, [])
    return (
        <div className='imagePool'>
            <div className='container'>
                <div className='row d-flex justify-content-between pt-5 pb-3'>
                    <div className="d-flex justify-content-start">

      <img src="logo.png" width="200px"  />
                    </div>

                    <div className='d-flex justify-content-end' >
                        <button
                            onClick={() => getaccount()}
                            className='btn btn-dark'>{btntext}</button>

                    </div>
                </div>
                <div className='row d-flex justify-content-center'>
                    <div className='col-md-12 col-11  presale-box pb-4 mb-2'>
                        <div className='row'>
                            <div className='col-md-6 col-7 pt-2'>
                                <p className='Presale-p pt-md-5 pt-3 ps-md-3 pb-md-3'>Pre-Sale is Live</p>
                                <p className='presale-p1 ps-md-3 pb-md-3 text-light'>Available Now</p>
                                <div className='d-flex justify-content-start align-items-md-center align-items-start  ps-md-3 pb-sm-3  prsale-cloumn'>
                                    <button className='btn  btn-dark'>InKoin Token</button>
                                    <span>  </span>
                                    <span id="presale-span1" className='ps-sm-3 ps-2'>Price: {price} $
                                        {/* {roadPrice ? `$ ${roadPrice}` :
                                        <span className='dot-stretching'></span>

                                    } */}

                                    </span>
                                </div>
                            </div>
                            <div className='col-md-6 col-5 d-flex justify-content-end align-items-sm-end lign-items-center '>
                                <img src={p305} className="presale-image" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row d-flex justify-content-center pb-5'>
                    <div className='col-md-12 col-11 presale-box1 pb-4 mb-2'>
                        <h4 className='pool-h4 pt-3'>InKoin PRE-SALE POOL HAS STARTED</h4>
                        {/* <p className='pool-p2 pt-2'>Stake $InKoin and get energy point for NFTs card</p> */}

                        <div className='row d-flex justify-content-center justify-content-evenly mt-3'>
                            <div className='col-lg-5 col-md-7 col-11 pool-box3 mb-4 mt-4'>
                                <h5 className='bool-h55 pt-sm-5 pt-3 fw-bold'>PRE-SALE</h5>
                                <div className='row d-flex justify-content-center pt-4 pb-2'>
                                    <div className='col-11 text-start'
                                    >
                                        <form>
                                            <label className="form-label  fw-sm-bold" style={{ color: "#fff" }}>$ USDT</label>
                                            <input type='number' onChange={() => calculatedRoadPrice()} ref={userEnterBNB} class="form-control" placeholder='0.00' min={1} />
                                        </form>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center pt-4 pb-2'>
                                    <div className='col-11 text-start'
                                    >
                                        <form>
                                            <label className="form-label fw-sm-bold" style={{ color: "#fff" }}>$ InKoin</label>
                                            <input type='number' class="form-control" placeholder={enterBNB} />
                                        </form>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-11 text-end'>
                                        <span id="preale-Available">Available:{usdtBalance}</span>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center pt-4 pb-2'>
                                    <div className='col-md-5 col-9'>
                                        
                                        <div className="d-grid gap-2">
                                            <button onClick={() => buyUSTDwithInkoin()} className='btn presalesbtn1' size="lg">
                                                Buy Inkoin
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center pt-5 pb-2 mb-3'>
                                    <div className='col-11 d-flex justify-content-between align-items-center'>
                                        <span className='presale-span '>Progress</span>
                                        <span className='presale-span1'>Current Pool</span>
                                    </div>
                                    <div className='col-11 presale-b0x1 pt-4 pb-4 mt-2'>
                                        <ProgressBar variant={"YOU_PICK_A_NAME"} style={{ Color: "#E24034" }} now={progress} />
                                        <div className='d-flex justify-content-between justify-content-center'>
                                            <span className='span-presale'>{progress}%</span>
                                            <span className='span-presale'>200,000,000 $InKoin</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-lg-5 col-md-7 col-11 pool-box3 mt-4 mb-4'>
                                <h5 className='bool-h55 pt-sm-5 pt-3 fw-bold'>PRE-SALE POOL</h5>

                                <div className='row d-flex justify-content-center mt-4'>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-2'>
                                        <div className='presale-span21 '>Total Supply</div>
                                        <div className='presale-span22'>{totalSupply.toLocaleString()} &nbsp;
                                            {/* {myroadTotalSupply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} &nbsp; */}
                                            <span className='presale-span1' style={{fontWeight:"bold"}}>Inkoin</span></div>
                                    </div>
                                    <div className='col-11 mt-3' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Token for Presales</div>
                                        <div className='presale-span22'>200,000,000 &nbsp;<span className='presale-span1' style={{fontWeight:"bold"}}>Inkoin</span></div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Price </div>
                                        <div className='presale-span22'>{price} $</div>
                                        {/* <div className='presale-span22'>{roadPrice ? `$ ${roadPrice}` :
                                            <span className='dot-collision'></span>

                                        } */}
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>


                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Minimum Purchase</div>
                                        <div className='presale-span22'>{minimumPrice} $
                                            {/* {minPurchase ? `${minPurchase}BNB` : <span className='dot-collision'></span>} */}
                                        </div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Max Purchase</div>
                                        <div className='presale-span22'> {maximumPrice} $
                                            {/* {maxPurchase ? `${maxPurchase}BNB` : <span className='dot-collision'></span>} */}
                                        </div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Start time</div>
                                        <div className='presale-span22'>
                                            15 Apr, 2022 UTC 21:00
                                            {/* {myDate.toLocaleString()} */}
                                        </div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>End time</div>
                                        <div className='presale-span22'>15 Apr, 2022 UTC 21:00</div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Soft Cap</div>
                                        <div className='presale-span22'>2,000&nbsp;
                                            {/* {mysoftCap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} */}
                                        USDT</div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>
                                <div className='row d-flex justify-content-center '>
                                    <div className='col-11 d-flex justify-content-between align-items-center mt-1'>
                                        <div className='presale-span21'>Hard Cap</div>
                                        <div className='presale-span22'>4,000&nbsp;
                                            {/* {myHardCap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} */}
                                            USDT</div>
                                    </div>
                                    <div className='col-11 mt-2' >
                                        <p style={{ border: "1px solid #292C38" }}></p>
                                    </div>
                                </div>

                                <h5 className='bool-h55 pt-3 fw-bold mb-3'>We accepted BNB</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // </div>
    )
}

export default Presale