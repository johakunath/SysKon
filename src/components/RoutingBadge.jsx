import React from 'react'

// SK-105: Sales-facing Einordnung (Standard/Bedingt/Sonderfall).
// Die Status-Ampel bleibt daneben als interne Guardrail bestehen – das Badge
// ersetzt sie nicht, es beantwortet nur „darf ich hier allein weiterarbeiten?".
// Die Grundkategorie ist eine interne Einordnung und bleibt der Internsicht
// vorbehalten.
export default function RoutingBadge({ routing, istIntern = false }) {
  if (!routing?.klasse) return null
  return (
    <span className={`routing-badge routing-${routing.klasse}`}>
      {routing.titel}
      {istIntern && routing.grundLabel ? <small> · {routing.grundLabel}</small> : null}
    </span>
  )
}
