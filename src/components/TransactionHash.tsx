interface TransactionHashProps {
  hash: string;
}

export function TransactionHash({ hash }: TransactionHashProps) {
  const explorerLink = `https://explorer.aptoslabs.com/txn/${hash}?network=mainnet`;
  return (
    <>
      View on Explorer:{" "}
      <a
        href={explorerLink}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 dark:text-blue-300"
      >
        {explorerLink}
      </a>
    </>
  );
}