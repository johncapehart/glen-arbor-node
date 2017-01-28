$script.scriptguid = 'b3e2b931-4f36-4623-9d26-50d7f113fa90'
{{{globaldefinitions}}}

function verify-guid {
    [CmdletBinding()]param(
        [string]$guid
    )
    if ($o.scriptguid -ne $script.scriptguid) { throw "guid mismatch" }
}

function connect-{{{$parent.config.psservice}}}
    [CmdletBinding()]param(
        [string]$context
    )
    verify-guid $context.scriptguid
    {{#if connectcommand}}
    $o = $context | convertfrom-json
    {{{connectcommand}}}
    {{/if}}
}

function configure-{{{$parent.config.psservice}}} {
    [CmdletBinding()]param(
        [string]$context
    )
    verify-guid $context.scriptguid
    {{#if configurecommand}}
    $o = $context | convertfrom-json
    {{{configurecommand}}}
    {{/if}}}

function get-{{{$parent.config.psservice}}}Items {
    [CmdletBinding()]param(
        [string]$context
    )
    verify-guid $context.scriptguid
    {{#if discovercommand}}
    $o = $context | convertfrom-json
    {{{discovercommand}}}
    {{/if}}}
}

function change-{{{$parent.config.psservice}}}Items {
    [CmdletBinding()]param(
        [string]$context
    )
    verify-guid $context.scriptguid
    {{#if changecommand}}
    $o = $context | convertfrom-json;
    $o.input | {{{changecommand}}}
    {{/if}}}
}

function report-{{{$parent.config.psservice}}}ChangedItems {
    [CmdletBinding()]param(
        [string]$context
    )
    verify-guid $context.scriptguid
    {{#if reportcommand}}
    $o = $context | convertfrom-json;
    $o.input | {{{reportcommand}}}
    {{/if}}}
}