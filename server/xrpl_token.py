import xrpl
from typing import Tuple
from rich.console import Console
from xrpl.wallet import generate_faucet_wallet
import asyncio

console = Console()

class XRPLTokenManager:
    async def __init__(self):
        console.print("""[cyan]
██╗  ██╗██████╗ ██████╗ ██╗      ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗
╚██╗██╔╝██╔══██╗██╔══██╗██║      ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║
    ╚███╔╝ ██████╔╝██████╔╝██║         ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║
    ██╔██╗ ██╔══██╗██╔═══╝ ██║         ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║
██╔╝ ██╗██║  ██║██║     ███████╗    ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
                                                                                
[bold green]🚀 Advanced Token Creation System v1.0[/bold green]
[dim]Powered by XRPL - The Future of Digital Assets[/dim]
""")

        # 🌐 Initialize network connection
        console.print("[bold yellow]⚡ Initializing XRPL Network Connection...[/bold yellow]")
        self.testnet_url = "https://testnet.xrpl-labs.com/"
        self.client = xrpl.clients.JsonRpcClient(self.testnet_url)

        # 🏦 Generate Wallets
        console.print("[bold blue]🔑 Generating Cold Storage Wallet...[/bold blue]")
        self.cold_wallet = await generate_faucet_wallet(self.client, debug=True)
        console.print("[bold blue]🔑 Generating Hot Wallet...[/bold blue]")
        self.hot_wallet = await generate_faucet_wallet(self.client, debug=True)

        # 🛠️ Configure Cold Wallet (Issuer)
        console.print("[bold blue]🔧 Configuring Cold Storage (Issuer) Settings...[/bold blue]")
        cold_settings_tx = xrpl.models.transactions.AccountSet(
            account=self.cold_wallet.address,
            transfer_rate=0,  # No transfer fee
            tick_size=5,      # Price increment in 10^-5
            domain=bytes.hex("example.com".encode("ASCII")),
            set_flag=xrpl.models.transactions.AccountSetAsfFlag.ASF_DEFAULT_RIPPLE,
        )

        response = await xrpl.transaction.submit_and_wait(cold_settings_tx, self.client, self.cold_wallet)
        console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

        # ⚙️ Configure Hot Wallet
        console.print("[bold blue]🔧 Configuring Hot Wallet Settings...[/bold blue]")
        hot_settings_tx = xrpl.models.transactions.AccountSet(
            account=self.hot_wallet.address,
            set_flag=xrpl.models.transactions.AccountSetAsfFlag.ASF_REQUIRE_AUTH,
        )

        response = await xrpl.transaction.submit_and_wait(hot_settings_tx, self.client, self.hot_wallet)
        console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

        # 🤝 Establish Trust Line
        console.print("[bold green]🔗 Establishing Trust Line Between Wallets...[/bold green]")
        self.currency_code = "AIA"
        trust_set_tx = xrpl.models.transactions.TrustSet(
            account=self.hot_wallet.address,
            limit_amount=xrpl.models.amounts.issued_currency_amount.IssuedCurrencyAmount(
                currency=self.currency_code,
                issuer=self.cold_wallet.address,
                value=str(1000000),  # Maximum supply limit
            )
        )

        response = await xrpl.transaction.submit_and_wait(trust_set_tx, self.client, self.hot_wallet)
        console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

    async def issue_token(self, issue_quantity: int) -> Tuple[dict, dict]:
        # 💸 Initial Token Issuance
        console.print(f"[bold magenta]💰 Initiating Token Issuance: {issue_quantity} {self.currency_code} [/bold magenta]")
        send_token_tx = xrpl.models.transactions.Payment(
            account=self.cold_wallet.address,
            destination=self.hot_wallet.address,
            amount=xrpl.models.amounts.issued_currency_amount.IssuedCurrencyAmount(
                currency=self.currency_code,
                issuer=self.cold_wallet.address,
                value=str(issue_quantity)
            )
        )

        response = await xrpl.transaction.submit_and_wait(send_token_tx, self.client, self.cold_wallet)
        console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

        # 📊 Balance Verification
        console.print("[bold cyan]📊 Verifying Final Balances...[/bold cyan]")
        
        hot_balance = await self.client.request(xrpl.models.requests.AccountLines(
            account=self.hot_wallet.address,
            ledger_index="validated",
        ))

        cold_balance = await self.client.request(xrpl.models.requests.GatewayBalances(
            account=self.cold_wallet.address,
            ledger_index="validated",
            hotwallet=[self.hot_wallet.address]
        ))

        # 🎉 Final Summary
        console.print("\n[bold green]✨ Token Creation Complete! ✨[/bold green]")
        console.print(f"""
[bold]Token Details:[/bold]
🪙 Name: {self.currency_code}
📈 Max Supply: 1000000
🏦 Issued Amount: {issue_quantity}
🔐 Cold Wallet: {self.cold_wallet.address}
🔥 Hot Wallet: {self.hot_wallet.address}
        """)

        return hot_balance, cold_balance

if __name__ == "__main__":
    # Example usage
    async def main():
        token_manager = await XRPLTokenManager()
        await token_manager.issue_token(10)
    
    asyncio.run(main())