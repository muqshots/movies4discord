import Image from "next/image";
import XMR from "../../public/XMR.png";
import BTC from "../../public/BTC.png";
import ETH from "../../public/ETH.png";
import LTC from "../../public/LTC.png";
import { IoIosCopy } from "react-icons/io";
import { useState } from "react";

const XMRAddress = '46Yvnfyr5RLCbvbzFe8ZMTMEJREDN8bkkD39NjQfTuwQ8ALGWXitLTeEnpcwZhY5uphqFkTRAFasFMxcEvFqWFD9H7v2LvG';

const Donate = () => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyClick = () => {
        const textArea = document.createElement('textarea');
        textArea.value = XMRAddress;

        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopySuccess(true);

        setTimeout(() => {
        setCopySuccess(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col justify-center items-center overflow-hidden">
            <text className="text-center">
                We accept donations in the following ways:<br /><br />
                Paypal: <span className="line-through">Currently unavailable</span><br />
                BTC (Bitcoin): bc1qgcj4xdkclsf2c95sp66caelrll85qsf6nt5hrh<br />
                ETH (Etherum): 0xb49F7C2fc50959c10535e92ec53B55A4d0021495<br />
                LTC (Litecoin): LhCuJW4uRaipTEeZuC5yg7HiDrNueCLmM9<br />
                <span className="inline-flex items-baseline">
                    XMR (Monero): {copySuccess && (
                        <span className="text-green-500">Address copied to clipboard!</span>
                    )}
                    <button
                        className="flex justify-between rounded-md bg-blue-500 ml-1 mt-1 py-2 px-4 transition active:bg-blue-600"
                        onClick={handleCopyClick}
                    >
                        <IoIosCopy className="h-[1] w-[1rem]" />
                        <div className="text-sm">Copy Address</div>
                    </button>
                </span>
                <br />
            </text>
            <div className="flex flex-col md:flex-row justify-center items-center mt-10">
                <div className="flex flex-row md:flex-col justify-center items-center  m-5">
                    <Image src={BTC} width={215} height={215} alt="BTC"></Image>
                    <text className="m-5">
                    BTC (Bitcoin)
                </text>
                </div>
                <div className="flex flex-row md:flex-col justify-center items-center m-5">
                    <Image src={XMR} width={215} height={215} alt="XMR"></Image>
                    <text className="m-5">
                    XMR (Monero)
                </text>
                </div>
                <div className="flex flex-row md:flex-col justify-center items-center m-5">
                <Image src={ETH} width={215} height={215} alt="ETH"></Image>
                <text className="m-5">
                ETH (Etherum)
                </text>
                </div>
                <div className="flex flex-row md:flex-col justify-center items-center m-5">
                <Image src={LTC} width={215} height={215} alt="LTC"></Image>
                <text className="m-5">
                    LTC (Litecoin)
                </text>
                </div>
            </div>
        </div>
    )
}

export default Donate;