import React, { useState, useEffect, useRef } from 'react';
import './SwapForm.css';
import twitterIcon from './assets/twitter.svg';
import telegramIcon from './assets/telegram.svg';
import logo from './assets/logo.svg';
import swapIcon from './assets/swap-icon.svg'; 

const SwapForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [selectedFromNetwork, setSelectedFromNetwork] = useState({});
  const [selectedToNetwork, setSelectedToNetwork] = useState({});
  const [networkData, setNetworkData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRate, setLoadingRate] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [userId, setUserId] = useState(null);
  const [hasError, setHasError] = useState(false); 
  const [mixerMode, setMixerMode] = useState(false); 
  const [privacyMode, setPrivacyMode] = useState(false); 
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const debounceTimer = useRef(null);

 
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        
        const response = await fetch("./tickers.json");
        console.log(response)
        const result = await response.json();

      
        if (result.status === 200) {
          setNetworkData(result.data);
          if (result.data.length > 0) {
            const fromNetwork = {
              ticker: result.data[0].ticker.toUpperCase(),
              network: result.data[0].network.toUpperCase(),
            };
            const toNetwork = {
              ticker: result.data[1].ticker.toUpperCase(),
              network: result.data[1].network.toUpperCase(),
            };
            setSelectedFromNetwork(fromNetwork);
            setSelectedToNetwork(toNetwork);
          }
        } else {
          console.error('Error fetching data:', result.status);
        }
      } catch (error) {
        console.error('Error fetching networks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < window.innerWidth) {
        document.querySelector('.swap-container').style.marginBottom = '60px';
      } else {
        document.querySelector('.swap-container').style.marginBottom = '0';
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      tgWebApp.ready();
      window.Telegram.WebApp.expand();
      const user = tgWebApp.initDataUnsafe.user;
      if (user) {
        setUserId(user.id);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (selectedFromNetwork && selectedToNetwork && amountToSend) {
        fetchExchangeRate();
      } else {
        setReceivedAmount('');
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer.current);
    };
  }, [selectedFromNetwork, selectedToNetwork, amountToSend]);
  const handlePrivacyMode = () => {
    setPrivacyMode(!privacyMode);
    
    
  };
  useEffect(() => {
    fetchExchangeRate(privacyMode);
  }, [privacyMode]); 
  const fetchExchangeRate = async (privacyModeS) => {
    console.log(privacyMode)
    const requestBody = {
      fromNetwork: selectedFromNetwork.network,
      toNetwork: selectedToNetwork.network,
      amount: amountToSend,
      fromCurrency: selectedFromNetwork.ticker,
      toCurrency: selectedToNetwork.ticker,
      privacy: privacyModeS,
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
        setFeeAmount(result.data.fee);
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

  const filteredNetworks = networkData.filter(network =>
    network.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );
 

  const handleClickOutside = (event) => {};

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

  const handleDropdownItemClick = (network, isFrom) => {
    if (isFrom) {
      setSelectedFromNetwork(network);
      setIsFromDropdownOpen(false);
      if (mixerMode) {
        setSelectedToNetwork(network);
      }
    } else {
      setSelectedToNetwork(network);
      setIsToDropdownOpen(false);
      if (mixerMode) {
        setSelectedFromNetwork(network); 
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExchange = async () => {
    if (!amountToSend || parseFloat(amountToSend) <= 0) {
      setHasError(true);
      setErrorMessage('Please enter the amount you want to send.');
      setTimeout(() => setHasError(false), 1000);
      return;
    }
  
    if (!recipientAddress.trim()) {
      setHasError(true);
      setErrorMessage('Please enter the recipient address.');
      setTimeout(() => setHasError(false), 1000);
      return;
    }

    const requestBody = {
      fromNetwork: selectedFromNetwork.network,
      toNetwork: selectedToNetwork.network,
      amount: amountToSend,
      fromCurrency: selectedFromNetwork.ticker,
      toCurrency: selectedToNetwork.ticker,
      recipientAddress: recipientAddress.trim(),
      userId: userId ? userId.toString() : null,
      privacy: privacyMode,
    };
  
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const response = await fetch('/api/bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (result.status === 500) {
          setHasError(true);
          setErrorMessage(result.data);
          setTimeout(() => setHasError(false), 1000);
        } else {
          Telegram.WebApp.openTelegramLink('https://t.me/ton_mix_bot');
          Telegram.WebApp.close();
          setHasError(false);
          setErrorMessage(''); 
        }
      } else {
        console.error('Error creating exchange:', result);
        setHasError(true);
        setErrorMessage(`Error creating exchange: ${result.data}`);
        setTimeout(() => setHasError(false), 1000);
      }
    } catch (error) {
      console.error('Error creating exchange:', error);
      setHasError(true);
      setErrorMessage('An error occurred while creating the exchange. Please try again and verify your deposit address.');
      setTimeout(() => setHasError(false), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMixerModeToggle = () => {
    setMixerMode(prevMode => !prevMode);
    if (!mixerMode) {
      setSelectedToNetwork(selectedFromNetwork);
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
            inputMode="decimal"
          />
          <div
            className="dropdown-header"
            onClick={handleFromDropdownToggle}
            ref={fromDropdownRef}
          >{loading ? (
            <span>Loading...</span>
          ) : (
            <>
              <span style={{ fontWeight: 'bold' }}>{selectedFromNetwork.ticker.toUpperCase()}</span>
              <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '5px' }}>{selectedFromNetwork.network.toUpperCase()}</span>
            </>
          )}
            
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
                filteredNetworks.map(network => (
                  <div
                  key={`${network.ticker}-${network.network}`} 
                    className="dropdown-item"
                    onClick={() => handleDropdownItemClick(network, true)}
                  >
                    <span style={{ fontWeight: 'bold' }}>{network.ticker.toUpperCase()}</span>
                    <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '5px' }}>{network.network.toUpperCase()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div className="swap-icon" onClick={() => {
        const temp = selectedFromNetwork;
        setSelectedFromNetwork(selectedToNetwork);
        setSelectedToNetwork(temp);
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
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span style={{ fontWeight: 'bold' }}>{selectedToNetwork.ticker.toUpperCase()}</span>
                <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '5px' }}>{selectedToNetwork.network.toUpperCase()}</span>
              </>
            )}
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
                filteredNetworks.map(network => (
                  <div
                  key={`${network.ticker}-${network.network}`} 
                    className="dropdown-item"
                    onClick={() => handleDropdownItemClick(network, false)}
                  >
                    <span style={{ fontWeight: 'bold' }}>{network.ticker.toUpperCase()}</span>
                    <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '5px' }}>{network.network.toUpperCase()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="switch-containers">
          <label>{privacyMode ? 'Privacy Mode: FULL 😶' : 'Privacy Mode: SEMI 💨'}</label>
          <div className={`switchs ${privacyMode ? 'on' : 'off'}`} onClick={handlePrivacyMode}>
            <div className="switch-toggles"></div>
          </div>
        </div>
        <div className="fee-info" style={{ color: 'black', marginTop: '8px' }}>
          {loadingRate ? 'Calculating fees...' : feeAmount !== undefined && `Fee: ${feeAmount} USD`}
        </div>
      </div>

      <div className="input-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient address"
          className="currency-input"
        />
      </div>

      <button className="exchange-button" onClick={handleExchange} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Exchange'}
      </button>

      {hasError && <div className="error-message">{errorMessage}</div>}

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
