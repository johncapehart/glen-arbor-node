$script.scriptguid = 'a1ea1f33-f6eb-4d16-8006-2e1d47dba9be'

globaldefinitions

function verify-guid {
    [CmdletBinding()]param(
        [string]$guid
    )
    if ($o.scriptguid -ne $script.scriptguid) { throw "guid mismatch" }
}

function connect-psservice
    [CmdletBinding()]param(
        [string]$json
    )
    verify-guid $json.scriptguid
    $o = $json | convertfrom-json
    connectcommand
}

function configure-psservice {
    [CmdletBinding()]param(
        [string]$json
    )
    verify-guid $json.scriptguid
    $o = $json | convertfrom-json
    configurecommand
}

function get-psserviceItems {
    [CmdletBinding()]param(
        [string]$json
    )
    verify-guid $json.scriptguid
    $o = $json | convertfrom-json
    discovercommand
}

function change-psserviceItems {
    [CmdletBinding()]param(
        [string]$json
    )
    verify-guid $json.scriptguid
    $o = $json | convertfrom-json
    $json.input
}

function report {
    [CmdletBinding()]param(
        [string]$json
    )
    verify-guid $json.scriptguid
    $o = $json | convertfrom-json
    reportcommand
}