const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
const { verify } = require("../utils/verify")

const imagesLocation = "./images/randomNfts"
const FUND_AMOUNT = "10000000000000000000"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris = [
        "ipfs://QmTk8nXDD7nRmRA4VN6JgeFyGbViNhmYnyGyyRdcwpoDm6",
        "ipfs://QmaJT7c62kL45YCAHW99Q3SWphKMFVv3887tdDSRVcwJ2z",
        "ipfs://QmatvK7PYxKqzZeihung7eQwHrD9ALRRp1hNwCjjkxgRun",
    ] //Done after already deploying them once and copying from console
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, args)
    }
}

module.exports.tags = ["all", "randomipfs", "main"]

async function handleTokenUris() {
    tokenUris = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    for (imageUploadResponseIndex in imageUploadResponses) {
        //create metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex]
            .replace(".png", "")
            .replace(".jpeg", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} puppy!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`

        //store JSON to pinata / IPFS
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }

    console.log(`Token URIs Uploaded!`)
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
