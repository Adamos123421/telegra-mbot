import React, { useState, useEffect, useRef } from 'react';
import './SwapForm.css';
import twitterIcon from './assets/twitter.svg';
import telegramIcon from './assets/telegram.svg';
import logo from './assets/logo.svg'; 

const SwapForm = () => {
  const [amountToSend, setAmountToSend] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('');
  const [selectedToCurrency, setSelectedToCurrency] = useState('');
  const [floatingRate, setFloatingRate] = useState(false);
  const [tickers, setTickers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRate, setLoadingRate] = useState(false); // Add loading state for exchange rate
  const [recipientAddress, setRecipientAddress] = useState('');

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  const proxyUrl = 'https://api.allorigins.win/get?url=';
  const exchangeRateUrl = 'https://estimate-pwil4mmbgq-uc.a.run.app';

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const targetUrl = encodeURIComponent('https://getcurrencies-pwil4mmbgq-uc.a.run.app/');
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();
        const result = JSON.parse(data.contents);
        if (result.status === 200) {
          setTickers(result.data);
          if (result.data.length > 0) {
            setSelectedFromCurrency(`${result.data[0].ticker} (${result.data[0].network})`);
            setSelectedToCurrency(`${result.data[1].ticker} (${result.data[1].network})`);
          }
        } else {
          console.error('Error fetching data:', result.status);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (selectedFromCurrency && selectedToCurrency) {
      // Only fetch exchange rate if there's a valid amount to send
      if (amountToSend) {
        fetchExchangeRate();
      } else {
        setReceivedAmount(''); // Reset received amount if amountToSend is empty
      }
    }
  }, [selectedFromCurrency, selectedToCurrency, amountToSend]);

  const fetchExchangeRate = async () => {
    const [fromCurrency, fromNetwork] = selectedFromCurrency.split(' (');
    const [toCurrency, toNetwork] = selectedToCurrency.split(' (');
    const trimmedFromNetwork = fromNetwork ? fromNetwork.replace(')', '') : '';
    const trimmedToNetwork = toNetwork ? toNetwork.replace(')', '') : '';
    const amount = parseFloat(amountToSend) || 0;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(500);

    const requestBody = {
      fromNetwork: trimmedFromNetwork,
      toNetwork: trimmedToNetwork,
      amount,
      fromCurrency: fromCurrency.trim(),
      toCurrency: toCurrency.trim()
    };

    setLoadingRate(true); // Set loadingRate to true before fetching

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          ,mode:"'no-cors"
        },
        
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      

      if (response.ok) {
        setReceivedAmount(result.data.amount);
      } else {
        console.error('Error fetching exchange rate:', result);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoadingRate(false); // Set loadingRate to false after fetching
    }
  };

  const filteredTickers = tickers.filter(ticker =>
    ticker.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClickOutside = (event) => {
   
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFromDropdownToggle = () => {
    setIsFromDropdownOpen(prev => !prev);
    setIsToDropdownOpen(false); // Close the other dropdown if open
  };

  const handleToDropdownToggle = () => {
    setIsToDropdownOpen(prev => !prev);
    setIsFromDropdownOpen(false); // Close the other dropdown if open
  };

  const handleDropdownItemClick = (currency, isFrom) => {
    if (isFrom) {
      setSelectedFromCurrency(currency);
      setIsFromDropdownOpen(false);
    } else {
      setSelectedToCurrency(currency);
      setIsToDropdownOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExchange = () => {
    if (!recipientAddress) {
      alert('Please enter the recipient address.');
      return;
    }
    const [fromCurrency, fromNetworkPart] = selectedFromCurrency.split(' (');
  const [toCurrency, toNetworkPart] = selectedToCurrency.split(' (');
  const fromNetwork = fromNetworkPart ? fromNetworkPart.replace(')', '') : '';
  const toNetwork = toNetworkPart ? toNetworkPart.replace(')', '') : '';
  
    // Log all the parameters
    console.log('Exchange Details:');
    console.log(`Amount to Send: ${amountToSend}`);
    console.log(`From Currency: ${fromCurrency.trim()}`);
    console.log(`From Network: ${fromNetwork}`);
    console.log(`To Currency: ${toCurrency.trim()}`);
    console.log(`To Network: ${toNetwork}`);
    console.log(`Amount to Receive: ${receivedAmount}`);
    console.log(`Recipient Address: ${recipientAddress}`);
    alert(`Exchanging ${amountToSend} ${selectedFromCurrency} to ${receivedAmount} ${selectedToCurrency} for recipient ${recipientAddress}`);
  };

  return (
    <div className="swap-container">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>Mixer Bridge</h2>
      </div>

      <div className="input-group">
        <label>You send</label>
        <div className="currency-select-group">
          <input
            type="number"
            value={amountToSend}
            onChange={(e) => setAmountToSend(e.target.value)}
            placeholder="Enter amount"
            className="currency-input"
          />
          <div
            className="dropdown-header"
            onClick={handleFromDropdownToggle}
            ref={fromDropdownRef}
          >
            {loading ? 'Loading...' : selectedFromCurrency || 'Select currency'}
          </div>
          {isFromDropdownOpen && (
            <div className="dropdown-menu show" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="search-input"
              />
              {loading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                filteredTickers.map((ticker, index) => (
                  <div
                    key={`${ticker.ticker}-${ticker.network}-${index}`}
                    className="dropdown-item"
                    onClick={() => handleDropdownItemClick(`${ticker.ticker} (${ticker.network})`, true)}
                  >
                    {ticker.ticker} ({ticker.network})
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="input-group">
        <label>Floating rate</label>
        <input
          type="checkbox"
          checked={floatingRate}
          onChange={() => setFloatingRate(!floatingRate)}
          disabled
        />
      </div>

      <div className="input-group">
        <label>You get</label>
        <div className="currency-select-group">
          <input
            type="number"
            value={loadingRate ? '...' : receivedAmount}
            readOnly
            placeholder={loadingRate ? 'Calculating...' : receivedAmount === '' ? 'Amount will be calculated' : ''}
            className="currency-input"
          />
          <div
            className="dropdown-header"
            onClick={handleToDropdownToggle}
            ref={toDropdownRef}
          >
            {loading ? 'Loading...' : selectedToCurrency || 'Select currency'}
          </div>
          {isToDropdownOpen && (
            <div className="dropdown-menu show" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="search-input"
              />
              {loading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                filteredTickers.map((ticker, index) => (
                  <div
                    key={`${ticker.ticker}-${ticker.network}-${index}`}
                    className="dropdown-item"
                    onClick={() => handleDropdownItemClick(`${ticker.ticker} (${ticker.network})`, false)}
                  >
                    {ticker.ticker} ({ticker.network})
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="input-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient address"
          className="recipient-input"
        />
      </div>

      <div className="warning-text">
        When exchanging a small sum, transaction fees can take a large portion
        of the exchange volume due to high network fees.
      </div>

      <button className="exchange-button" onClick={handleExchange}>
        Exchange
      </button>

      <div className="footer">
        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
          <img src={twitterIcon} alt="Twitter" className="footer-icon" />
        </a>
        <a href="https://t.me/" target="_blank" rel="noopener noreferrer">
          <img src={telegramIcon} alt="Telegram" className="footer-icon" />
        </a>
      </div>
    </div>
  );
};

export default SwapForm;
