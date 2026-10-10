#!/usr/bin/env bash
set +e
mkdir -p public/__builddiag
run_check() {
  local name="$1"
  shift
  "$@" > "public/__builddiag/${name}.txt" 2>&1
  local code=$?
  printf '%s\n' "$code" > "public/__builddiag/${name}.exit"
}
run_check lint npm run lint
run_check typecheck npm run typecheck
run_check contracts npm run test:contracts
run_check build npm run build
exit 0
