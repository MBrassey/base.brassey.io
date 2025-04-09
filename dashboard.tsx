"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Bell,
  ChevronDown,
  CreditCard,
  DollarSign,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  User,
  Wallet,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <nav className="flex h-14 items-center border-b bg-background px-4 lg:h-[60px]">
        <div className="flex items-center gap-2 lg:gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="px-6 py-4">
                <Link href="#" className="flex items-center gap-2 font-semibold">
                  <Wallet className="h-6 w-6" />
                  <span>CryptoTrack</span>
                </Link>
              </div>
              <div className="border-t">
                <div className="grid gap-2 px-2 py-2">
                  <Link
                    href="#"
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
                  >
                    <Wallet className="h-4 w-4" />
                    Portfolio
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
                  >
                    <CreditCard className="h-4 w-4" />
                    Transactions
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="#" className="flex items-center gap-2 font-semibold">
            <Wallet className="h-6 w-6" />
            <span className="hidden md:inline">CryptoTrack</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <form className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 rounded-lg bg-background pl-8 md:w-80 lg:w-96"
              />
            </div>
          </form>
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Image src="/mystical-forest-spirit.png" width={32} height={32} alt="Avatar" className="rounded-full" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r bg-background md:flex lg:w-[240px]">
          <div className="flex flex-col gap-2 p-4">
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            >
              <Wallet className="h-4 w-4" />
              Portfolio
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            >
              <CreditCard className="h-4 w-4" />
              Transactions
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 font-semibold text-lg md:text-2xl">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter
              </Button>
              <Button size="sm" className="h-8">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Asset
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bitcoin (BTC)</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <path d="M12.5 7.5h-1v2h-2v1h2v2h-2v1h2v2h1v-2h2v-1h-2v-2h2v-1h-2z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$29,345.50</div>
                <div className="flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-500">+4.3% today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ethereum (ETH)</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <path d="M9.5 9.5l3-3 3 3M12 6.5v8M9.5 14.5l3 3 3-3" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234.21</div>
                <div className="flex items-center">
                  <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-500">-2.1% today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cardano (ADA)</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,652.18</div>
                <div className="flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-500">+1.2% today</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PriceChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>You made 265 transactions this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/20 p-1">
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="font-medium">Bought Bitcoin</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">+0.0045 BTC</div>
                        <div className="text-sm text-muted-foreground">Apr 2, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-red-500/20 p-1">
                          <ArrowDown className="h-3 w-3 text-red-500" />
                        </div>
                        <div className="font-medium">Sold Ethereum</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">-1.23 ETH</div>
                        <div className="text-sm text-muted-foreground">Apr 1, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/20 p-1">
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="font-medium">Bought Cardano</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">+120.45 ADA</div>
                        <div className="text-sm text-muted-foreground">Mar 28, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/20 p-1">
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="font-medium">Bought Ethereum</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">+2.0 ETH</div>
                        <div className="text-sm text-muted-foreground">Mar 24, 2023</div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="buy" className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/20 p-1">
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="font-medium">Bought Bitcoin</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">+0.0045 BTC</div>
                        <div className="text-sm text-muted-foreground">Apr 2, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/20 p-1">
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="font-medium">Bought Cardano</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">+120.45 ADA</div>
                        <div className="text-sm text-muted-foreground">Mar 28, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/20 p-1">
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="font-medium">Bought Ethereum</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">+2.0 ETH</div>
                        <div className="text-sm text-muted-foreground">Mar 24, 2023</div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="sell" className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-red-500/20 p-1">
                          <ArrowDown className="h-3 w-3 text-red-500" />
                        </div>
                        <div className="font-medium">Sold Ethereum</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-medium">-1.23 ETH</div>
                        <div className="text-sm text-muted-foreground">Apr 1, 2023</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/bitcoin-circuit.png"
                        width={24}
                        height={24}
                        alt="BTC"
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">Bitcoin</div>
                        <div className="text-sm text-muted-foreground">BTC</div>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">$29,345.50</div>
                      <div className="flex items-center justify-end">
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <div className="text-sm text-green-500">4.3%</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/ethereal-threads.png"
                        width={24}
                        height={24}
                        alt="ETH"
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">Ethereum</div>
                        <div className="text-sm text-muted-foreground">ETH</div>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">$12,234.21</div>
                      <div className="flex items-center justify-end">
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        <div className="text-sm text-red-500">2.1%</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/abstract-geometric-ada.png"
                        width={24}
                        height={24}
                        alt="ADA"
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">Cardano</div>
                        <div className="text-sm text-muted-foreground">ADA</div>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">$3,652.18</div>
                      <div className="flex items-center justify-end">
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <div className="text-sm text-green-500">1.2%</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/sol-abstract.png"
                        width={24}
                        height={24}
                        alt="SOL"
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">Solana</div>
                        <div className="text-sm text-muted-foreground">SOL</div>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">$1,795.32</div>
                      <div className="flex items-center justify-end">
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <div className="text-sm text-green-500">3.5%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Markets
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500" />
                      <div className="font-medium">Bitcoin</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">45%</div>
                      <div className="text-sm text-muted-foreground">$29,345.50</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-purple-500" />
                      <div className="font-medium">Ethereum</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">30%</div>
                      <div className="text-sm text-muted-foreground">$12,234.21</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <div className="font-medium">Cardano</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">15%</div>
                      <div className="text-sm text-muted-foreground">$3,652.18</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500" />
                      <div className="font-medium">Solana</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-medium">10%</div>
                      <div className="text-sm text-muted-foreground">$1,795.32</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Rebalance Portfolio
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex-col gap-1">
                    <ArrowUp className="h-5 w-5" />
                    <span>Buy</span>
                  </Button>
                  <Button className="h-20 flex-col gap-1" variant="outline">
                    <ArrowDown className="h-5 w-5" />
                    <span>Sell</span>
                  </Button>
                  <Button className="h-20 flex-col gap-1" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>Send</span>
                  </Button>
                  <Button className="h-20 flex-col gap-1" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Refer</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      More Options
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem>Swap Tokens</DropdownMenuItem>
                    <DropdownMenuItem>Stake Crypto</DropdownMenuItem>
                    <DropdownMenuItem>Set Price Alerts</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Transaction History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

function PriceChart() {
  return (
    <div className="h-[200px] w-full">
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-8 w-8 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <div className="text-sm">Chart visualization would appear here</div>
        </div>
      </div>
    </div>
  )
}
