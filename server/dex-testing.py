import asyncio
import pprint
from decimal import Decimal

from xrpl.asyncio.clients import AsyncWebsocketClient
from xrpl.asyncio.transaction import (
    autofill_and_sign,
    submit_and_wait,
)
from xrpl.asyncio.wallet import generate_faucet_wallet
from xrpl.models.currencies import (
    IssuedCurrency,
    XRP,
)
from xrpl.models.requests import (
    AccountLines,
    AccountOffers,
    BookOffers,
)
from xrpl.models.transactions import OfferCreate
from xrpl.utils import (
    drops_to_xrp,
    get_balance_changes,
    xrp_to_drops,
)

class DEXTrader:
    def __init__(self):
        self.client = None
        self.wallet = None
        
    async def initialize(self):
        self.client = AsyncWebsocketClient("wss://testnet.xrpl-labs.com/")
        await self.client.open()
        print("Requesting addresses from the Testnet faucet...")
        self.wallet = await generate_faucet_wallet(self.client, debug=True)
        
    async def close(self):
        if self.client:
            await self.client.close()

    @staticmethod
    def amt_str(amt) -> str:
        if isinstance(amt, str):
            return f"{drops_to_xrp(amt)} XRP"
        else:
            return f"{amt['value']} {amt['currency']}.{amt['issuer']}"

    async def invoke_transaction(self, currency: str, value: str, issuer: str = "rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd"):
        if not self.client or not self.wallet:
            raise Exception("DEXTrader not initialized. Call initialize() first")

        # Define the trade parameters
        we_want = {
            "currency": IssuedCurrency(currency=currency, issuer=issuer),
            "value": value,
        }

        we_spend = {
            "currency": XRP(),
            "value": xrp_to_drops(float(value) * 10 * 1.15),  # 10 XRP per token * 15% FX cost
        }

        proposed_quality = Decimal(we_spend["value"]) / Decimal(we_want["value"])

        # Check orderbook
        print("Requesting orderbook information...")
        orderbook_info = await self.client.request(
            BookOffers(
                taker=self.wallet.address,
                ledger_index="current",
                taker_gets=we_want["currency"],
                taker_pays=we_spend["currency"],
                limit=10,
            )
        )
        print(f"Orderbook:\n{pprint.pformat(orderbook_info.result)}")

        # Create and submit transaction
        tx = OfferCreate(
            account=self.wallet.address,
            taker_gets=we_spend["value"],
            taker_pays=we_want["currency"].to_amount(we_want["value"]),
        )

        signed_tx = await autofill_and_sign(tx, self.client, self.wallet)
        print("Sending OfferCreate transaction...")
        result = await submit_and_wait(signed_tx, self.client)
        
        if not result.is_successful():
            raise Exception(f"Error sending transaction: {result}")
            
        print(f"Transaction succeeded: https://testnet.xrpl.org/transactions/{signed_tx.get_hash()}")
        
        # Get final balances
        balances = await self.client.request(
            AccountLines(
                account=self.wallet.address,
                ledger_index="validated",
            )
        )
        
        return {
            "transaction_hash": signed_tx.get_hash(),
            "balances": balances.result,
            "balance_changes": get_balance_changes(result.result["meta"])
        }

async def main():
    trader = DEXTrader()
    try:
        await trader.initialize()
        result = await trader.invoke_transaction("USDT", "25")
        print(f"Transaction result: {pprint.pformat(result)}")
    finally:
        await trader.close()

if __name__ == "__main__":
    asyncio.run(main())
