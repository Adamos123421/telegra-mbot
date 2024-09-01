import React, { useState, useEffect, useRef } from 'react';
import './SwapForm.css';
import twitterIcon from './assets/twitter.svg';
import telegramIcon from './assets/telegram.svg';
import logo from './assets/logo.svg';
import swapIcon from './assets/swap-icon.svg'; 

const SwapForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('');
  const [selectedToCurrency, setSelectedToCurrency] = useState('');
  const [tickers, setTickers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRate, setLoadingRate] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [userId, setUserId] = useState(null);
  const [hasError, setHasError] = useState(false); 
  const [mixerMode, setMixerMode] = useState(false); 
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const debounceTimer = useRef(null);

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
    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Telegram Web App API is available');
      const tgWebApp = window.Telegram.WebApp;
      tgWebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.disableVerticalSwipes();
      const user = tgWebApp.initDataUnsafe.user;
      if (user) {
        setUserId(user.id);
      } else {
        console.log('User is not available');
      }
    } else {
      console.log('Telegram Web App is not available');
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (selectedFromCurrency && selectedToCurrency && amountToSend) {
        fetchExchangeRate();
      } else {
        setReceivedAmount('');
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer.current);
    };
  }, [selectedFromCurrency, selectedToCurrency, amountToSend]);

  const fetchExchangeRate = async () => {
    const [fromCurrency, fromNetwork] = selectedFromCurrency.split(' (');
    const [toCurrency, toNetwork] = selectedToCurrency.split(' (');
    const trimmedFromNetwork = fromNetwork ? fromNetwork.replace(')', '') : '';
    const trimmedToNetwork = toNetwork ? toNetwork.replace(')', '') : '';
    const amount = parseFloat(amountToSend) || 0;

    const requestBody = {
      fromNetwork: trimmedFromNetwork,
      toNetwork: trimmedToNetwork,
      amount,
      fromCurrency: fromCurrency.trim(),
      toCurrency: toCurrency.trim()
    };

    setLoadingRate(true);

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      setLoadingRate(false);
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
    setIsToDropdownOpen(false);
  };

  const handleToDropdownToggle = () => {
    setIsToDropdownOpen(prev => !prev);
    setIsFromDropdownOpen(false);
  };

  const handleDropdownItemClick = (currency, isFrom) => {
    if (isFrom) {
      setSelectedFromCurrency(currency);
      setIsFromDropdownOpen(false);
      if (mixerMode) {
        setSelectedToCurrency(currency);
      }
    } else {
      setSelectedToCurrency(currency);
      setIsToDropdownOpen(false);
      if (mixerMode) {
        setSelectedFromCurrency(currency); 
      }
    }
  };


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExchange = async () => {
    if (!recipientAddress.trim()) {
      setHasError(true);
      setTimeout(() => setHasError(false), 1000);
      setErrorMessage('Please enter the recipient address.');
      return;
    }
  
    const [fromCurrency, fromNetworkPart] = selectedFromCurrency.split(' (');
    const [toCurrency, toNetworkPart] = selectedToCurrency.split(' (');
    const fromNetwork = fromNetworkPart ? fromNetworkPart.replace(')', '') : '';
    const toNetwork = toNetworkPart ? toNetworkPart.replace(')', '') : '';
    const requestBody = {
      fromNetwork,
      fromCurrency: fromCurrency.trim(),
      toNetwork,
      toCurrency: toCurrency.trim(),
      amount: parseFloat(amountToSend),
      recipientAddress: recipientAddress.trim(),
      userId: userId.toString()
    };
  
    setIsLoading(true);
    setErrorMessage(''); 
  
    try {
      const response = await fetch("/api/bridge", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (result.data === 'Something went wrong') {
          setHasError(true);
          setTimeout(() => setHasError(false), 1000);
          setErrorMessage('Exchange failed. Please check the deposit wallet.');
        } else {
          console.log('Exchange created successfully:', result);
          Telegram.WebApp.openTelegramLink('https://t.me/ton_mix_bot');
          Telegram.WebApp.close();
          setHasError(false);
          setErrorMessage(''); // Clear error message on success
        }
      } else {
        console.error('Error creating exchange:', result);
        setHasError(true);
        setTimeout(() => setHasError(false), 1000);
        
        setErrorMessage(`Error creating exchange: ${result.data}`);
      }
    } catch (error) {
      console.error('Error creating exchange:', error);
      setHasError(true);
      setTimeout(() => setHasError(false), 1000);
      setErrorMessage('An error occurred while creating the exchange. Please try again and verify your deposit address.');
    } finally {
      setIsLoading(false); 
    }
  };
  

  const handleMixerModeToggle = () => {
    setMixerMode((prevMode) => !prevMode);
    if (!mixerMode) {
      
      setSelectedToCurrency(selectedFromCurrency);
    }
  };

  return (
    <div className="swap-container">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>Mixer Bridge</h2>
      </div>
      <div className="switch-container">
        <label>Mixer Mode</label>
        <div className={`switch ${mixerMode ? 'on' : 'off'}`} onClick={handleMixerModeToggle}>
          <div className="switch-toggle"></div>
        </div>
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
      <div className="swap-icon" onClick={() => {
       
       const temp = selectedFromCurrency;
       setSelectedFromCurrency(selectedToCurrency);
       setSelectedToCurrency(temp);
     }}>
       <img src={swapIcon} alt="Swap" className="swap-icon-img" />
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
      className={`dropdown-header ${mixerMode ? 'disabled' : ''}`}
      onClick={handleToDropdownToggle}
      ref={toDropdownRef}
    >
      {loading ? 'Loading...' : selectedToCurrency || 'Select currency'}
    </div>
    {isToDropdownOpen && !mixerMode && (
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
    onChange={(e) => {
      setRecipientAddress(e.target.value);
      setHasError(false); // Reset error state when user types
    }}
    placeholder="Enter recipient address"
    className={`recipient-input ${hasError ? 'input-error' : ''}`}
  />
  {errorMessage && <div className="error-message">{errorMessage}</div>}
</div>

      <div className="warning-text">
        When exchanging a small sum, transaction fees can take a large portion
        of the exchange volume due to high network fees.
      </div>

      <button
  className={`exchange-button ${isLoading ? 'loading' : ''}`}
  onClick={handleExchange}
  disabled={isLoading} // Disable button while loading
>
  {isLoading ? 'Processing...' : selectedFromCurrency === selectedToCurrency ? 'Mixer' : 'Bridge'}
</button>


      <div className="footer">
        <a href="https://x.com/tonmixbot" target="_blank" rel="noopener noreferrer">
          <img src={twitterIcon} alt="Twitter" className="footer-icon" />
        </a>
        <a href="https://t.me/tonmixerchat" target="_blank" rel="noopener noreferrer">
          <img src={telegramIcon} alt="Telegram" className="footer-icon" />
        </a>
      </div>
    </div>
  );
};

export default SwapForm;