import React, { useState ,useEffect , useRef} from 'react';
import { Image,
  Box, VStack, Text, Button, Flex, Input, IconButton, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, InputGroup, InputRightElement, HStack
} from '@chakra-ui/react';
import { FiSearch, FiChevronDown, FiPlus, FiMinus } from 'react-icons/fi';
import { FaLock } from 'react-icons/fa';  // Lock icon for Private mode
import { FaArrowsRotate } from 'react-icons/fa6';



function Exchange() {
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceivedAmount] = useState('');
  const [fees, setFeeAmount] = useState('');
  
  const [fromToken, setFromToken] = useState('SOL');
  const [fromNet, setFromNet] = useState('SOL');
  const [errorMessage, setErrorMessage] = useState('');

  const [toToken, setToToken] = useState('TON');
  const [toNet, setToNet] = useState('TON');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectingToken, setSelectingToken] = useState(''); // 'from' or 'to'
  const [fromSearchQuery, setFromSearchQuery] = useState(''); // Search query for "from" token
  const [toSearchQuery, setToSearchQuery] = useState(''); // Search query for "to" token
  const [privacyMode, setPrivacyMode] = useState('fast');
  const [recipientAddress, setRecipientAddress] = useState(''); // Single recipient address
  const [tokens, setTokens] = useState([]);
  const debounceTimer = useRef(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loadings,setloadings]=useState(false)

  const [minAmount,setMinAmount]=useState(0)
  const [maxAmount,setMaxAmount]=useState(0)
  const [inEstimate, setInEstimate] = useState(0);
  const [outEstimate, setOutEstimate] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(null);
  const [estimatedFeeUsd, setEstimatedFeeUsd] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  // Privacy mode state: 'standard' or 'private'
 
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

  const handleTokenSelection = (symbol,net) => {
    if (selectingToken === 'from') {
      setFromToken(symbol);
      setFromNet(net);

    } else {
      setToToken(symbol);
      setToNet(net)
    }
    onClose();
  };

  const openTokenModal = (type) => {
    setSelectingToken(type);
    onOpen();
  };

  // Filter tokens for the "from" token modal
  const filteredFromTokens = tokens
    .map(token => {
      const queries = fromSearchQuery.toLowerCase().split(' ');
      let priority = 0;
      
      // Check if any query terms match both ticker and network exactly
      queries.forEach(query => {
        if (token.ticker.toLowerCase() === query && token.network.toLowerCase() === query) {
          priority = 4;
        }
      });

      // Check if separate query terms match ticker and network exactly
      if (queries.length === 2) {
        if ((token.ticker.toLowerCase() === queries[0] && token.network.toLowerCase() === queries[1]) ||
            (token.ticker.toLowerCase() === queries[1] && token.network.toLowerCase() === queries[0])) {
          priority = 4;
        }
      }

      // Partial matches
      if (priority === 0) {
        const matchBoth = queries.some(query =>
          token.ticker.toLowerCase().includes(query) &&
          token.network.toLowerCase().includes(query)
        );
        const matchTickerExact = queries.some(query => 
          token.ticker.toLowerCase() === query
        );
        const matchNetworkExact = queries.some(query =>
          token.network.toLowerCase() === query
        );
        const matchTicker = queries.some(query => 
          token.ticker.toLowerCase().includes(query)
        );
        const matchNetwork = queries.some(query =>
          token.network.toLowerCase().includes(query)
        );

        // Check if all query terms match the ticker
        const allTermsMatchTicker = queries.every(query =>
          token.ticker.toLowerCase().includes(query)
        );

        if (matchTickerExact && matchNetworkExact) priority = 3;
        else if (matchBoth) priority = 2;
        else if (allTermsMatchTicker) priority = 1.5; // Higher priority for tokens matching all search terms
        else if (matchTickerExact || matchNetworkExact) priority = 1;
        else if (matchTicker || matchNetwork) priority = 0.5;
      }
      
      return {
        token,
        priority
      };
    })
    .filter(item => item.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.token);

  // Filter tokens for the "to" token modal with same prioritization
  const filteredToTokens = tokens
    .map(token => {
      const queries = toSearchQuery.toLowerCase().split(' ');
      let priority = 0;
      
      // Check if any query terms match both ticker and network exactly
      queries.forEach(query => {
        if (token.ticker.toLowerCase() === query && token.network.toLowerCase() === query) {
          priority = 4;
        }
      });

      // Check if separate query terms match ticker and network exactly
      if (queries.length === 2) {
        if ((token.ticker.toLowerCase() === queries[0] && token.network.toLowerCase() === queries[1]) ||
            (token.ticker.toLowerCase() === queries[1] && token.network.toLowerCase() === queries[0])) {
          priority = 4;
        }
      }

      // Partial matches
      if (priority === 0) {
        const matchBoth = queries.some(query =>
          token.ticker.toLowerCase().includes(query) &&
          token.network.toLowerCase().includes(query)
        );
        const matchTickerExact = queries.some(query => 
          token.ticker.toLowerCase() === query
        );
        const matchNetworkExact = queries.some(query =>
          token.network.toLowerCase() === query
        );
        const matchTicker = queries.some(query => 
          token.ticker.toLowerCase().includes(query)
        );
        const matchNetwork = queries.some(query =>
          token.network.toLowerCase().includes(query)
        );

        // Check if all query terms match the ticker
        const allTermsMatchTicker = queries.every(query =>
          token.ticker.toLowerCase().includes(query)
        );

        if (matchTickerExact && matchNetworkExact) priority = 3;
        else if (matchBoth) priority = 2;
        else if (allTermsMatchTicker) priority = 1.5; // Higher priority for tokens matching all search terms
        else if (matchTickerExact || matchNetworkExact) priority = 1;
        else if (matchTicker || matchNetwork) priority = 0.5;
      }
      
      return {
        token,
        priority
      };
    })
    .filter(item => item.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.token);

  // Set the filtered tokens based on whether the "from" or "to" modal is open
  const filteredTokens = selectingToken === 'from' ? filteredFromTokens : filteredToTokens;

  // Function to toggle privacy mode on clicking anywhere on the switch
  const togglePrivacyMode = () => {
    setPrivacyMode((prevMode) => (prevMode === 'fast' ? 'standard' : prevMode === 'standard' ? 'private' : 'fast'));
  };
  useEffect(() => {
    
    const fetchTokens = async () => {
      const response = await fetch('./tickers.json');
      const data = await response.json();
      setTokens(data);
      setErrorMessage('');
      
      const currencyResponse = await fetch('/api/currencies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const currencyResult = await currencyResponse.json();
      const currencyData = currencyResult.data;
      setTokens(currencyData);
      setErrorMessage('');
    };
    fetchTokens();
  }, []);
 
  // useEffect(() => {
  //   fetchExchangeRate(privacyMode);
  //   setErrorMessage('');
  // }, []); 

  const fetchExchangeRate = async (privacyMode) => {
    clearTimeout(debounceTimer.current);

    setReceivedAmount('');
    setFeeAmount('');
    setMinAmount(0);
    setMaxAmount(0);
    setInEstimate(0);
    setOutEstimate(0);
    setEstimatedFee(null);
    setEstimatedFeeUsd(0);
    setEstimatedTime(null);
    setWarningMessage(null);
    if (!toToken || !fromToken || !fromNet || !toNet || !sendAmount) {
      return;
    }
    setLoadingRate(true);
    const requestBody = {
      fromCurrency: fromToken,
      toCurrency: toToken,
      fromNetwork: fromNet,
      toNetwork: toNet,
      amount: sendAmount,
      privacy: privacyMode === 'private' ? 'full' : privacyMode,
      // recipientAddress: recipientAddress.trim() !== '' ? recipientAddress : '', // Use single address
    };

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log(requestBody, result);
      if (result.status === 500) {
        const minAmount = result.data.range.minAmount;
        const maxAmount = result.data.range.maxAmount;
        console.log(`Min amount is ${minAmount}. Max amount is ${maxAmount !== null && maxAmount !== -1 ? maxAmount : 'unlimited'}`);
        if (minAmount) {
          setErrorMessage(`Min amount is ${minAmount}. Max amount is ${maxAmount !== null && maxAmount !== -1 ? maxAmount : 'unlimited'}`);
        } else {
          console.error('Error fetching exchange rate 3:', result);
        }
        return;
      }

      const minAmount = result.data.minAmount;
      const maxAmount = result.data.maxAmount;
      if (sendAmount < minAmount || (maxAmount > -1 && sendAmount > maxAmount)) {
        setErrorMessage(`Min amount is ${minAmount}. Max amount is ${maxAmount !== null && maxAmount !== -1 ? maxAmount : 'unlimited'}`);
        return;
      }

      if (response.ok) {
        setFeeAmount(result.data.fee);
        setReceivedAmount(result.data.amount);
        setMinAmount(result.data.minAmount);
        setMaxAmount(result.data.maxAmount);
        setInEstimate(result.data.inEstimate);
        setOutEstimate(result.data.outEstimate);
        setEstimatedFee(result.data.estimatedFee);
        setEstimatedFeeUsd(result.data.estimatedFeeUsd);
        setEstimatedTime(result.data.estimatedTime);
        setWarningMessage(result.data.warningMessage);
      } else {
        console.error('Error fetching exchange rate 1:', result);
      }
    } catch (error) {
      console.error('Error fetching exchange rate: 2', error);
    } finally {
      setLoadingRate(false);
    }
  };
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setReceivedAmount('');
    setFeeAmount('');
    setMinAmount(0);
    setMaxAmount(0);
    setInEstimate(0);
    setOutEstimate(0);
    setEstimatedFee(null);
    setEstimatedFeeUsd(0);
    setEstimatedTime(null);
    setWarningMessage(null);
    setErrorMessage('');

    debounceTimer.current = setTimeout(() => {
      if (!toToken || !fromToken || !fromNet || !toNet || !sendAmount) {
        return;
      }
      fetchExchangeRate(privacyMode);
    }, 333);

    return () => {
      clearTimeout(debounceTimer.current);
    };
  }, [privacyMode, fromToken, fromNet, toToken, toNet, sendAmount]);
  const handleExchange = async () => {
    if (sendAmount < minAmount || (maxAmount > -1 && sendAmount > maxAmount)) {
      setErrorMessage(`Min amount is ${minAmount}. Max amount is ${maxAmount !== null && maxAmount !== -1 ? maxAmount : 'unlimited'}`);
      return;
    }
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      setErrorMessage('Please enter the amount you want to send.');
      return;
    }
  
    if (!recipientAddress.trim()) {
      setErrorMessage('Please enter a recipient address.');
      return;
    }

    const requestBody = {
        fromNetwork: fromNet,
        toNetwork: toNet,
        amount: parseFloat(sendAmount),
        fromCurrency: fromToken,
        toCurrency: toToken,
        recipientAddress: recipientAddress, // Single address
        userId: userId ? userId.toString() : null,
        privacy: privacyMode === 'private' ? 'full' : privacyMode,
        inEstimate,
        outEstimate,
        estimatedFee,
        estimatedFeeUsd,
        estimatedTime,
        warningMessage
    };
  
   
    setErrorMessage('');
  
    try {
      setloadings(true)
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
          
          setErrorMessage(result.data);
          setloadings(false)
       
        } else {
          Telegram.WebApp.openTelegramLink('https://t.me/ton_mix_bot');
          Telegram.WebApp.close();
        
          setErrorMessage(''); 
        }
      } else {
        console.error('Error creating exchange:', result);
        setloadings(false)
        setErrorMessage(`Error creating exchange: ${result.data}`);
       
      }
    } catch (error) {
      setloadings(false)
      setErrorMessage('id');
      
    } finally {
      setloadings(false)
    }
  };

  return (
    <Box 
  minH="100vh" 
  display="flex" 
  flexDirection="column" 
  justifyContent="center" 
  alignItems="center" 
  bg="rgba(0, 0, 0, 0)"  // Black with 60% opacity
  color="white"
  position="relative"
>

         {/* Logo and Wallet Connect Button */}
      
      {/* Box container */}
      <VStack 
        spacing={4} 
        p={10} 
        bg="gray.800" 
        borderRadius="20" 
        w={["88%", "50%", "90%"]}
      
        boxShadow={privacyMode === 'fast' ? "0px 0px 15px rgba(255, 255, 255, 0.6)" : privacyMode === 'private' ? "0px 0px 15px rgba(0, 255, 0, 0.6)" : "0px 0px 15px rgba(144,212,238)"}
        border={privacyMode === 'fast' ? "1px solid rgba(255, 255, 255, 0.5)" : privacyMode === 'private' ? "1px solid rgba(0, 255, 0, 0.5)" : "1px solid rgba(144,212,238)"}
      >
        <HStack spacing={4} alignItems="center">
  <Image src="./favicon-1.png" alt="Logo" boxSize="50px" />
  <Text fontSize="2xl" fontWeight="bold">
    Mixer Bridge
  </Text>
</HStack>
        
        <Text fontSize="md" color="gray.400">
          Simple & Private, Just Mix It
        </Text>

        {/* Privacy Mode Toggle - Entire HStack is clickable */}
        <Box
          as="button"
          onClick={togglePrivacyMode}
          w="fit-content"
          p={1}
          bg="gray.700"
          borderRadius="lg"
        >
          <HStack spacing={0}>
            {/* Fast Mode Button (appears like a button, but controlled by the parent Box click) */}
            <Button
              colorScheme={privacyMode === 'fast' ? 'blue' : 'gray'}
              variant={privacyMode === 'fast' ? 'solid' : 'ghost'}
              borderRadius="lg"
              px={6}
              pointerEvents="none"  // Disable individual button clicks
            >
              💨 Fast
            </Button>

            {/* Standard Mode Button (appears like a button, but controlled by the parent Box click) */}
            <Button
              colorScheme={privacyMode === 'standard' ? 'blue' : 'gray'}
              variant={privacyMode === 'standard' ? 'solid' : 'ghost'}
              borderRadius="lg"
              px={6}
              pointerEvents="none"  // Disable individual button clicks
            >
              😶 Standard
            </Button>

            {/* Private Mode Button */}
            <Button
              leftIcon={<FaLock />}
              colorScheme={privacyMode === 'private' ? 'green' : 'gray'}
              variant={privacyMode === 'private' ? 'solid' : 'ghost'}
              borderRadius="lg"
              px={6}
              pointerEvents="none"  // Disable individual button clicks
            >
              Private
            </Button>
          </HStack>
        </Box>

        {/* Send Section */}
        <VStack align="stretch" w="100%" spacing={2} mt={1}>
          <Text color="gray.400">You Send</Text>
          <Flex alignItems="center" bg="gray.700" p={3} borderRadius="30" position="relative">
            <Input
              placeholder="0"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              size="lg"
              variant="unstyled"
              color="white"
              flex="1"
            />
            {/* Line Separator */}
            <Divider orientation="vertical" borderColor={privacyMode === 'fast' ? "rgba(255, 255, 255, 0.5)" : privacyMode === 'standard' ? "rgba(0, 255, 0, 0.5)" : " rgba(59,114,149)"} h="70%" mx={2} />  {/* Green or Blue hue */}
            <Button
            onClick={() => openTokenModal('from')}
            size="lg"
            variant="unstyled"
            color="white"
            ml={2}
            display="flex"
            alignItems="center"
            >
            <VStack align="flex-start" spacing={0}> 
                <Text>{fromToken.toUpperCase()}</Text>  {/* Token ticker */}
                <Text fontSize="sm" color="gray.400">{fromNet.toUpperCase()}</Text> {/* Network name */}
            </VStack>
            <FiChevronDown style={{ marginLeft: '8px' }} /> {/* Dropdown arrow */}
            </Button>
       
          </Flex>
        </VStack>

        {/* Swap Arrow Button */}
        <Flex justify="center" align="center" w="100%" mt={0}>
          <IconButton
            aria-label="Swap tokens"
            icon={<FaArrowsRotate />}
            size="40"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'white' }}
            onClick={() => {
              const _toToken = toToken;
              const _toNet = toNet;
              const _fromToken = fromToken;
              const _fromNet = fromNet;
              setFromToken(_toToken);
              setFromNet(_toNet);
              setToToken(_fromToken);
              setToNet(_fromNet);
              onClose();
            }}
          />
        </Flex>

        {/* Receive Section */}
        <VStack align="stretch" w="100%" spacing={1}>
          <Text color="gray.400">You Get</Text>
          <Flex alignItems="center" bg="gray.700" p={3} borderRadius="25" position="relative">
            <Input
              placeholder={loadingRate ? 'Calculating...' : '0'}
              value={loadingRate ? '' : receiveAmount}
              readOnly
              size="lg"
              variant="unstyled"
              color="white" 
              flex="1"
            />
            {/* Line Separator */}
            <Divider orientation="vertical" borderColor={privacyMode === 'fast' ? "rgba(255, 255, 255, 0.5)" : privacyMode === 'standard' ? "rgba(0, 255, 0, 0.5)" : " rgba(59,114,149)"} h="70%" mx={2} />  {/* Green or Blue hue */}
                        <Button
            onClick={() => openTokenModal('to')}
            size="lg"
            variant="unstyled"
            color="white"
            ml={2}
            display="flex"
            alignItems="center"
            >
            <VStack align="flex-start" spacing={0}> 
                <Text>{toToken.toUpperCase()}</Text>  {/* Token ticker */}
                <Text fontSize="sm" color="gray.400">{toNet.toUpperCase()}</Text> {/* Network name */}
            </VStack>
            <FiChevronDown style={{ marginLeft: '8px' }} /> {/* Dropdown arrow */}
            </Button>
          </Flex>
        </VStack>
        {/* Fees Section */}
        <Text color="gray.400" mt={1}>
          Estimated Fees: {loadingRate ? '...' : fees !== '' && fees !== '0' && fees !== undefined && fees !== null ? `$${fees}` : '$0.00'}
        </Text>

        {/* Single Recipient Address */}
        <Box w="100%">
          <Text mb={2}>Recipient Address</Text>
          <Input
            placeholder="Enter recipient address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </Box>

        {/* Exchange Button */}
        {errorMessage && (  // Show error message if present
          <Text color="red.500" mt={4}>
            {errorMessage}
          </Text>
        )}
        <Button
          colorScheme="green"
          bg="green.600"
          _hover={{ bg: "green.500" }}
          size="lg"
          isFullWidth
          onClick={handleExchange} 
        >
          {loadings ? 'Bridging...' : 'Bridge'}
        </Button>
      </VStack>

      {/* Token Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
      <ModalOverlay 
        bg="rgba(0, 0, 0, 0.8)" // Dark overlay for background blur
        backdropFilter="blur(10px)" // Blur effect for background
      />
      <ModalContent 
        bg="gray.800" 
        color="white" 
        borderRadius="lg" 
        boxShadow={privacyMode === 'fast' ? "0 4px 10px rgba(255, 255, 255, 0.2)" : privacyMode === 'standard' ? "0 4px 10px rgba(0, 255, 0, 0.2)" : "0 4px 10px rgba(0, 0, 255, 0.2)"}
        maxH="80vh" // Fix the size and make it scrollable
      >
        <ModalHeader>Select Token</ModalHeader>
        <ModalBody maxH="44vh" overflowY="auto">  {/* Scrollable content */}
          <InputGroup mb={4}>
            <Input 
              placeholder="Search assets or address" 
              variant="filled" 
              bg="gray.700"
              onChange={(e) => selectingToken === 'from' ? setFromSearchQuery(e.target.value) : setToSearchQuery(e.target.value)}
            />
            <InputRightElement children={<FiSearch color="gray.400" />} />
          </InputGroup>

          <VStack spacing={3} align="stretch">
          {filteredTokens.map((token, index) => (
              <Box 
                key={`${token.ticker}-${index}`}  // Use unique key based on ticker and index
                p={3} 
                bg="gray.700" 
                borderRadius="md" 
                boxShadow="0 4px 10px rgba(0, 0, 255, 0.2)" 
                onClick={() => handleTokenSelection(token.ticker,token.network)}
              >
                <HStack justify="space-between">
                  <VStack align="flex-start">
                    <Text fontWeight="bold">{token.ticker.toUpperCase()}</Text>
                    <Text fontSize="sm" color="gray.400">{token.network.toUpperCase()}</Text>
                  </VStack>
                </HStack>
                <Divider borderColor="gray.600" mt={2} />
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" onClick={onClose} w="full" position="sticky" bottom={0}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    <Box mt={0} p={10}>
        <HStack spacing={40}>
          <Button as="a" href="https://x.com/tonmixbot" target="_blank" variant="link" color="gray.400" _hover={{ color: "white" }}>
           
            <Text ml={2}>Twitter</Text>
          </Button>
          <Button as="a" href="https://t.me/tonmixerchat" target="_blank" variant="link" color="gray.400" _hover={{ color: "white" }}>
            
            <Text ml={2}>Telegram</Text>
          </Button>
        </HStack>
      </Box>
    </Box>
    
  );
}

export default Exchange;
