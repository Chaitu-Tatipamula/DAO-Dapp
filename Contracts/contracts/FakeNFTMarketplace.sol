// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

contract FakeNFTMarketplace{
    mapping (uint256 => address) public tokens;

    uint256 nftPrice = 0.01 ether;

    function purchase(uint256 _tokenId) external payable {
        require(msg.value >= nftPrice,"NOT_ENOUGH_ETH");
        require(tokens[_tokenId]==address(0),"Token Not available");
        tokens[_tokenId] = msg.sender;
    }

    function getPrice( ) external view returns(uint256){
        return nftPrice;
    }

    function available(uint256 _tokenId) external view returns(bool){
        if(tokens[_tokenId] == address(0)){
            return true;
        }

        return false;
    }

}