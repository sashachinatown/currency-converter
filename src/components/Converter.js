import React from 'react';
import { useState, useEffect } from 'react';

import swapArrows from '../assets/swap_arrows.png';


const Converter = () => {

    const [amountFrom, setAmountFrom] = useState('');
    const [amountTo, setAmountTo] = useState('');
    const [convertFrom, setConvertFrom] = useState('usd');
    const [convertTo, setConvertTo] = useState('uah');
    const [pasted, setPasted] = useState(false);
    const [rates, setRates] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetch('https://api.monobank.ua/bank/currency')
            .then(res => res.json())
            .then(data => setRates({usd: data[0]["rateSell"], eur: data[1]["rateSell"]}))
            .catch(err => setErrorMessage('Could not reach server to get up-to-date currency rates.\nMost likely you have exceeded Monobank API limit (1 request in 5 minutes).\nLast update: 05/01/23'))
    }, [])

    const currencies = {
        usd: {
            usd: 1,
            uah: rates.usd || 37.44,
            eur: (rates.usd / rates.eur) || 0.937,
        },
        eur: {
            eur: 1,
            uah: rates.eur || 39.95,
            usd: (rates.eur / rates.usd) || 1.067,
        },
        uah: {
            uah: 1,
            usd: 1 / (rates.usd || 37.44),
            eur: 1 / (rates.eur || 39.95),
        }
    }

    function checkInput(e){
        setPasted(false);
        let allowed = '1234567890.';
        let input = e.currentTarget.value;
        let afterPoint = [];
        
        if (input.indexOf('.') !== -1) {
            afterPoint = input.slice(input.indexOf('.'), -1);
        }

        if (    input.indexOf('.') !== input.lastIndexOf('.') || 
                allowed.indexOf(input[input.length - 1]) === -1 ||
                (input[0] === '0' &&  input[1] === '0') ||
                input > 10000000 || 
                afterPoint.length > 2
            ) {
            input = input.slice(0, -1);
        }

        e.currentTarget.value = input;
    }

    const handleChangeAmountFrom = (e) => {
        if (pasted) {
            e.currentTarget.value = '';
        }

        if (!e.currentTarget.value) {
            setAmountFrom('');
        } else if (e.currentTarget.value[0] === '.') {
            setAmountFrom('0' + e.currentTarget.value);
        } else {
            setAmountFrom(e.currentTarget.value);
        }

        let result = e.currentTarget.value * currencies[convertFrom][convertTo];

        if (result) {
            if (Number.isInteger(result)) {
                setAmountTo(result);
            } else {
                setAmountTo(result.toFixed(2));
            }
        } else {
            setAmountTo('');
        }
    }

    const handleChangeAmountTo = (e) => {
        if (pasted) {
            e.currentTarget.value = '';
        }

        if (!e.currentTarget.value) {
            setAmountTo('');
        } else if (e.currentTarget.value[0] === '.') {
            setAmountTo('0' + e.currentTarget.value);
        } else {
            setAmountTo(e.currentTarget.value);
        }

        let result = e.currentTarget.value / currencies[convertFrom][convertTo];
        if (result) {
            if (Number.isInteger(result)) {
                setAmountFrom(result);
            } else {
                setAmountFrom(result.toFixed(2));
            }
        } else {
            setAmountFrom('');
        }
    }

    
    const handleChangeConvertFrom = (e) => {
        setConvertFrom(e.currentTarget.value);
        let result = amountFrom * currencies[e.currentTarget.value][convertTo];
        if (result) {
            if (Number.isInteger(result)) {
                setAmountTo(result);
            } else {
                setAmountTo(result.toFixed(2));
            }
        } else {
            setAmountTo('');
        }
    }

    const handleChangeConvertTo = (e) => {
        setConvertTo(e.currentTarget.value);
        let result = amountFrom * currencies[convertFrom][e.currentTarget.value];
        if (result) {
            if (Number.isInteger(result)) {
                setAmountTo(result);
            } else {
                setAmountTo(result.toFixed(2));
            }
        } else {
            setAmountTo('');
        }
    }

    const handlePaste = (e) => {
        setPasted(true);
    };

    const handleSwap = (e) => {
        e.preventDefault();
        setAmountFrom(amountTo);
        setAmountTo(amountFrom);
        setConvertFrom(convertTo);
        setConvertTo(convertFrom);
    }

    return (
        <header className='w-full flex flex-col flex-wrap justify-center items-center'>
                <div className='mt-4 flex flex-col flex-wrap justify-start items-center'>
                    <form action="" className='py-4 flex flex-row justify-center items-start'>
                        <div className='flex flex-row justify-center items-start'>
                            <div className='flex flex-row items-center'>
                                <p className=' md:text-base sm:text-sm text-xs text-black font-normal text'>From:</p>
                                <div className="ml-4 relative mt-1 rounded-md shadow-sm">
                                <input
                                    value={amountFrom}
                                    onChange={handleChangeAmountFrom}
                                    onInput={checkInput}
                                    onPaste={handlePaste}
                                    placeholder="0.00"
                                    type="text" 
                                    min='0' 
                                    className="block w-full rounded-md border-2 border-gray-300 py-2 px-4 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                
                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                        <label htmlFor="currency" className="sr-only">Currency</label>
                                        <select
                                        value={convertFrom}
                                        onChange={handleChangeConvertFrom}
                                        id="currency" 
                                        name="currency" 
                                        className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-2 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                            <option value='usd'>USD</option>
                                            <option value='eur'>EUR</option>
                                            <option value='uah'>UAH</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button onClick={handleSwap} className='ml-8'><img src={swapArrows} alt="swap" className='w-[28px]'/></button>

                                <p className='ml-4 md:text-base sm:text-sm text-xs text-black font-normal text'>To:</p>
                                <div className="ml-4 relative mt-1 rounded-md shadow-sm">
                                <input
                                    value={amountTo}
                                    onChange={handleChangeAmountTo}
                                    onInput={checkInput}
                                    onPaste={handlePaste}
                                    placeholder="0.00"
                                    type="text" 
                                    min='0' 
                                    className="block w-full rounded-md border-2 border-gray-300 py-2 px-4 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                
                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                        <label htmlFor="currency" className="sr-only">Currency</label>
                                        <select
                                        value={convertTo}
                                        onChange={handleChangeConvertTo}
                                        id="currency" name="currency" className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-2 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                            <option value='usd'>USD</option>
                                            <option value='eur'>EUR</option>
                                            <option value='uah'>UAH</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <span className='text-sm text-neutral-500 font-normal italic whitespace-pre-wrap'>{rates.length === 0 ? errorMessage : ''}</span>
        </header>
        
    )
}

export default Converter