import { getApiWithTimeout, chainMeta } from "./portaldot";
import { formatPot } from "./format";

export interface BlockSummary {
  number: number;
  hash: string;
  extrinsics: number;
}

export async function recentBlocks(count = 8, network?: string): Promise<BlockSummary[]> {
  const api = await getApiWithTimeout(network);
  const head = await api.rpc.chain.getHeader();
  const top = head.number.toNumber();
  const nums: number[] = [];
  for (let i = 0; i < count && top - i >= 0; i++) nums.push(top - i);
  return Promise.all(
    nums.map(async (bn) => {
      const hash = await api.rpc.chain.getBlockHash(bn);
      const block = await api.rpc.chain.getBlock(hash);
      return { number: bn, hash: hash.toHex(), extrinsics: block.block.extrinsics.length };
    })
  );
}

export interface ExtrinsicView {
  index: number;
  section: string;
  method: string;
  signer?: string;
}

export async function blockDetail(numberOrHash: string | number, network?: string) {
  const api = await getApiWithTimeout(network);
  const hash =
    typeof numberOrHash === "number" ? (await api.rpc.chain.getBlockHash(numberOrHash)).toString() : numberOrHash;
  const block = await api.rpc.chain.getBlock(hash);
  const extrinsics: ExtrinsicView[] = block.block.extrinsics.map((ex, index) => ({
    index,
    section: ex.method.section,
    method: ex.method.method,
    signer: ex.isSigned ? ex.signer.toString() : undefined,
  }));
  return {
    number: block.block.header.number.toNumber(),
    hash: block.block.header.hash.toHex(),
    extrinsics,
  };
}

export interface TransferView {
  block: number;
  from: string;
  to: string;
  amount: string;
}

// Scan recent blocks for balances.Transfer events ("show me recent transfers").
export async function recentTransfers(scan = 12, network?: string): Promise<TransferView[]> {
  const api = await getApiWithTimeout(network);
  const { decimals, symbol } = chainMeta(api);
  const head = await api.rpc.chain.getHeader();
  const top = head.number.toNumber();
  const nums: number[] = [];
  for (let i = 0; i < scan && top - i >= 0; i++) nums.push(top - i);
  const perBlock = await Promise.all(
    nums.map(async (bn) => {
      const hash = await api.rpc.chain.getBlockHash(bn);
      const apiAt = await api.at(hash);
      const events: any = await apiAt.query.system.events();
      const xs: TransferView[] = [];
      for (const rec of events) {
        const { event } = rec;
        if (event.section === "balances" && event.method === "Transfer") {
          const [from, to, amount] = event.data;
          xs.push({
            block: bn,
            from: from.toString(),
            to: to.toString(),
            amount: formatPot(amount.toBigInt(), decimals, symbol),
          });
        }
      }
      return xs;
    })
  );
  return perBlock.flat().slice(0, 20);
}
