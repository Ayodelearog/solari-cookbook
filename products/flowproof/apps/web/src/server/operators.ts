export function isFlowProofOperator(userId: string | null | undefined) {
  if (!userId) return false;
  const configured = process.env.FLOWPROOF_OPERATOR_USER_IDS;
  if (!configured) return false;
  return configured.split(",").map((value) => value.trim()).filter(Boolean).includes(userId);
}
