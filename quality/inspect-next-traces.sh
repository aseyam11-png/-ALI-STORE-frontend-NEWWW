#!/usr/bin/env bash
set -euo pipefail

scan_roots=()
trace_count=0

if [[ -d .next/server && ! -L .next/server ]]; then
  scan_roots+=(.next/server)
  server_trace_count="$(find .next/server -type f -name '*.nft.json' -print | wc -l)"
  trace_count=$((trace_count + server_trace_count))
fi

root_trace=".next/next-server.js.nft.json"
if [[ -f "$root_trace" && ! -L "$root_trace" ]]; then
  scan_roots+=("$root_trace")
  trace_count=$((trace_count + 1))
fi

report="### Next.js server output tracing: dependency reachability"
report+=$'\n'"Trace manifests inspected: $trace_count"

if (( trace_count == 0 )); then
  report+=$'\n'"No Next.js `.nft.json` trace manifests were found in the expected server output locations."
fi

for package_name in '@parcel/watcher' 'picomatch'; do
  pattern="node_modules/${package_name}(/|$)"

  if (( trace_count == 0 )); then
    matches=""
  elif matches="$(grep -rInE --include='*.nft.json' "$pattern" "${scan_roots[@]}" 2>/dev/null)"; then
    :
  else
    grep_status=$?
    if (( grep_status != 1 )); then
      printf 'Trace scan failed for %s (grep exit %s)\n' "$package_name" "$grep_status" >&2
      exit "$grep_status"
    fi
    matches=""
  fi

  if [[ -z "$matches" ]]; then
    report+=$'\n'"- $package_name: no references found in inspected server traces."
  else
    match_count="$(printf '%s\n' "$matches" | wc -l)"
    report+=$'\n'"- $package_name: FOUND; matching trace entries: $match_count"
    report+=$'\n'"$matches"
  fi
done

printf '%s\n' "$report"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  printf '\n%s\n' "$report" >> "$GITHUB_STEP_SUMMARY"
fi
