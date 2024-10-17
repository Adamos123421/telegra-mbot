import React, { useState, useEffect } from 'react';
import { 
  ChakraProvider, Box, Flex, Text, VStack, HStack, IconButton, useDisclosure, Image, Button, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '@chakra-ui/react';
import { FiBox, FiRefreshCw, FiSettings } from 'react-icons/fi';  // Chest, Exchange, and Settings icons
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';  // Import TON Connect Button and hook
import Exchange from './Exchange';
// Example token data for the "Chest" section
const tokens = [
  {
    name: 'YUME',
    amount: '2 412 674,93',
    icon: 'https://example.com/yume.png',  // Example icon URL
  },
  {
    name: 'STON',
    amount: '0,02',
    icon: 'https://example.com/ston.png',  // Example icon URL
  },
];

// Navigation bar component
function NavigationMenu({ setCurrentSection }) {
  return (
    <Flex 
      position="fixed" 
      bottom={0} 
      w="100vw" 
      bg="rgba(26, 26, 26, 0.8)"  // Translucent dark background
      backdropFilter="blur(8px)"  // Blur effect
      justifyContent="space-around"
      alignItems="center"
      p={3}
      zIndex={10}  // Ensure it stays on top
    >
      <IconButton 
        aria-label="Exchange" 
        icon={<FiRefreshCw />}  // Exchange/Trade icon
        color="white" 
        variant="ghost"
        onClick={() => setCurrentSection('exchange')} 
      />
      <IconButton 
        aria-label="Chest" 
        icon={<FiBox />}  // Chest icon
        color="white" 
        variant="ghost"
        onClick={() => setCurrentSection('chest')} 
      />
      
      <IconButton 
        aria-label="Settings" 
        icon={<FiSettings />}  // Settings icon
        color="white" 
        variant="ghost"
        onClick={() => setCurrentSection('settings')} 
      />
    </Flex>
  );
}

// "Chest" section displaying tokens
function Chest({ walletAddress }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedToken, setSelectedToken] = useState(null);

  const handleTokenClick = (token) => {
    setSelectedToken(token);  // Set the token that was clicked
    onOpen();  // Open the modal
  };

  return (
    <>
      {/* Display wallet address if connected */}
      {walletAddress ? (
        <>
          

          {/* Display token cards if the wallet is connected */}
          <VStack spacing={0} align="stretch" w="100%" maxW="400px" mx="auto">
            {tokens.map((token, index) => (
              <TokenCard token={token} key={index} onClick={() => handleTokenClick(token)} />
            ))}
          </VStack>
        </>
      ) : (
        // Display a message if the wallet is not connected
        <VStack spacing={6} mt={10}>
          <Text fontSize="xl" color="gray.400">
            Connect your wallet to see your tokens in the Chest
          </Text>
        </VStack>
      )}

      {/* Modal for Token Actions */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.6)" backdropFilter="blur(20px)" />
        <ModalContent bg="black" color="blue.100" mx={4} maxW="90vw" boxShadow="2xl">
          <ModalHeader>{selectedToken?.name} Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Amount: {selectedToken?.amount}</Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose} w="100%" boxShadow="lg">
              Cancel
            </Button>
            <Button colorScheme="green" w="100%" boxShadow="lg">
              Deposit
            </Button>
            <Button colorScheme="blue" w="100%" ml={2} boxShadow="lg">
              Withdraw
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// Placeholder components for other sections

function Settings() {
  return (
    <VStack spacing={6} mt={10}>
      <Text fontSize="xl" color="gray.400">
        Settings Section (Comming Soon)
      </Text>
    </VStack>
  );
}
function Chests() {
  return (
    <VStack spacing={6} mt={10}>
      <Text fontSize="xl" color="gray.400">
        Chest Mistery Utility (Comming Soon)
      </Text>
    </VStack>
  );
}

// Token Card component
function TokenCard({ token, onClick }) {
  return (
    <>
      <Flex 
        justify="space-between" 
        align="center" 
        p={3} 
        bg="#1A1A1A"  // Dark grey background for the token card (color from the uploaded image)
        borderRadius="md" 
        w="100%" 
        onClick={onClick} 
        cursor="pointer"
      >
        <HStack spacing={3}>
          <Image boxSize="40px" src={token.icon} alt={`${token.name} icon`} borderRadius="full" />
          <VStack align="flex-start" spacing={1}>
            <Text color="white" fontWeight="bold">{token.name}</Text>  {/* Token name */}
          </VStack>
        </HStack>
        <VStack align="flex-end" spacing={1}>
          <Text color="white">{token.amount}</Text>  {/* Token amount */}
        </VStack>
      </Flex>
      <Divider borderColor="gray.600" />  {/* Line to separate tokens */}
    </>
  );
}

function App() {
  const [currentSection, setCurrentSection] = useState('chest');  // Track the current section
  const walletAddress = useTonAddress();  // Get the wallet address using the useTonAddress hook

  useEffect(() => {
    if (walletAddress) {
      console.log('Wallet connected:', walletAddress);
    }
  }, [walletAddress]);

  return (
      <ChakraProvider>
        <Box 
    minH="100vh" 
    bgGradient="linear(to-b, black, #1c1f24)"  // Black to dark gray gradient
    color="white" 
    p={3}  
    display="flex" 
    flexDirection="column" 
    justifyContent="center" 
    alignItems="center"
    w="100vw"  
    overflowX="hidden"  
  >

        {/* Top Right: TON Connect Button */}
        <Flex position="absolute" top={5} right={5}>
           {/* Button to connect wallet */}
        </Flex>

        {/* Render the current section based on navigation */}
        {currentSection === 'chest' && <Chests />}
        {currentSection === 'exchange' && <Exchange />}
        {currentSection === 'settings' && <Settings />}

        {/* Bottom Navigation Menu (Translucent) */}
        <NavigationMenu setCurrentSection={setCurrentSection} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
