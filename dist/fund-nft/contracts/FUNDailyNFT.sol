//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// implements the ERC721 standard
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// keeps track of the number of token issued
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Accesing the Ownable method ensures that only the creator of the smart contract can interact with it

contract FundNFT is ERC721, Ownable {
	using Counters for Counters.Counter;
        using Strings for uint256;
	Counters.Counter private _tokenIds;

        // Optional mapping for token URI's
        mapping (uint256 => string) private _tokenURIs;

        // Base URI
        string private _baseURIextended;

	// the name and symbol for the NFT
	constructor() ERC721("FUNDayli", "FUND") {}

        function setBaseURI(string memory baseURI_) external onlyOwner() {
            _baseURIextended = baseURI_;
        }

        function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
            require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
            _tokenURIs[tokenId] = _tokenURI;
        }

        function _baseURI() internal view virtual override returns (string memory) {
            return _baseURIextended;
        }

        /*function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
            require(_exists(tokenId), "ERC721Metadata: URI query of nonexistent token");
            string memory _tokenURI = _tokenURIs[tokenId];
            string memory base = _baseURI();

            // if there is no base URI, returns the token URI.
            if (bytes(base).length == 0) {
              return _tokenURI;
            }

            // if both are set, concatenate the baseURI and tokenURI (via abi.encodePacked)
            if (bytes(_tokenURI).length > 0) {
              return string(abi.encodePacked(base, _tokenURI));
            }

            // if there is baseURI but no tokenURI, concatenate the tokenID to the baseURI.
            return string(abi.encodePacked(base, tokenId.toString()));
        }*/

        function mint(
            address _to,
            uint256 _tokenId,
            string memory tokenURI_
        ) external onlyOwner() {
            _mint(_to, _tokenId);
            _setTokenURI(_tokenId, tokenURI_);
        }

	// Create a function to mint/create the NFT
	// receiver takes a type of address. This is the wallet address of the user that should receive the NFT minted using the smart contract
	// tokenURI takes a string that contains metadata about the NFT

	function createNFT(address receiver, string memory tokenURI) public onlyOwner returns (uint256) {
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_mint(receiver, newItemId);
		_setTokenURI(newItemId, tokenURI);

		// returns the id for the newly created token
		return newItemId;
	}

}
