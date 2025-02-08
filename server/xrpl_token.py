import xrpl
from typing import Tuple
from rich.console import Console
from xrpl.wallet import generate_faucet_wallet

console = Console()

def print_banner():
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

def create_token(name: str, supply: int, issue_quantity: int) -> Tuple[dict, dict]:
    """
    🏭 Creates a new token on the XRPL testnet with specified parameters
    
    Args:
        name (str): Token identifier (3-4 chars recommended)
        supply (int): Maximum token supply
        issue_quantity (int): Initial amount to issue
        
    Returns:
        Tuple[dict, dict]: Hot and cold wallet balances
    """
    print_banner()
    
    # 🌐 Initialize network connection
    console.print("[bold yellow]⚡ Initializing XRPL Network Connection...[/bold yellow]")
    testnet_url = "https://testnet.xrpl-labs.com/"
    client = xrpl.clients.JsonRpcClient(testnet_url)

    # 🏦 Generate Wallets
    console.print("[bold blue]🔑 Generating Cold Storage Wallet...[/bold blue]")
    cold_wallet = generate_faucet_wallet(client, debug=True)
    console.print("[bold blue]🔑 Generating Hot Wallet...[/bold blue]")
    hot_wallet = generate_faucet_wallet(client, debug=True)

    # 🛠️ Configure Cold Wallet (Issuer)
    console.print("[bold blue]🔧 Configuring Cold Storage (Issuer) Settings...[/bold blue]")
    cold_settings_tx = xrpl.models.transactions.AccountSet(
        account=cold_wallet.address,
        transfer_rate=0,  # No transfer fee
        tick_size=5,      # Price increment in 10^-5
        domain=bytes.hex("example.com".encode("ASCII")),
        set_flag=xrpl.models.transactions.AccountSetAsfFlag.ASF_DEFAULT_RIPPLE,
    )

    response = xrpl.transaction.submit_and_wait(cold_settings_tx, client, cold_wallet)
    console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

    # ⚙️ Configure Hot Wallet
    console.print("[bold blue]🔧 Configuring Hot Wallet Settings...[/bold blue]")
    hot_settings_tx = xrpl.models.transactions.AccountSet(
        account=hot_wallet.address,
        set_flag=xrpl.models.transactions.AccountSetAsfFlag.ASF_REQUIRE_AUTH,
    )

    response = xrpl.transaction.submit_and_wait(hot_settings_tx, client, hot_wallet)
    console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

    # 🤝 Establish Trust Line
    console.print("[bold green]🔗 Establishing Trust Line Between Wallets...[/bold green]")
    currency_code = name
    trust_set_tx = xrpl.models.transactions.TrustSet(
        account=hot_wallet.address,
        limit_amount=xrpl.models.amounts.issued_currency_amount.IssuedCurrencyAmount(
            currency=currency_code,
            issuer=cold_wallet.address,
            value=str(supply),  # Maximum supply limit
        )
    )

    response = xrpl.transaction.submit_and_wait(trust_set_tx, client, hot_wallet)
    console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

    # 💸 Initial Token Issuance
    console.print(f"[bold magenta]💰 Initiating Token Issuance: {issue_quantity} {currency_code}[/bold magenta]")
    send_token_tx = xrpl.models.transactions.Payment(
        account=cold_wallet.address,
        destination=hot_wallet.address,
        amount=xrpl.models.amounts.issued_currency_amount.IssuedCurrencyAmount(
            currency=currency_code,
            issuer=cold_wallet.address,
            value=str(issue_quantity)
        )
    )

    response = xrpl.transaction.submit_and_wait(send_token_tx, client, cold_wallet)
    console.print(f"[dim]Transaction Hash: {response.result['hash']}[/dim]")

    # 📊 Balance Verification
    console.print("[bold cyan]📊 Verifying Final Balances...[/bold cyan]")
    
    hot_balance = client.request(xrpl.models.requests.AccountLines(
        account=hot_wallet.address,
        ledger_index="validated",
    ))

    cold_balance = client.request(xrpl.models.requests.GatewayBalances(
        account=cold_wallet.address,
        ledger_index="validated",
        hotwallet=[hot_wallet.address]
    ))

    # 🎉 Final Summary
    console.print("\n[bold green]✨ Token Creation Complete! ✨[/bold green]")
    console.print(f"""
[bold]Token Details:[/bold]
🪙 Name: {currency_code}
📈 Max Supply: {supply}
🏦 Issued Amount: {issue_quantity}
🔐 Cold Wallet: {cold_wallet.address}
🔥 Hot Wallet: {hot_wallet.address}
    """)

    return hot_balance, cold_balance

if __name__ == "__main__":
    # Example usage
    create_token("COO", 1000000, 100000)