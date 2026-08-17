# Example Output

Here's a complete example of the changelog summary format:

```
## Claude Code Changelog Summary
**Period**: January 7, 2025 → January 19, 2025
**Total Releases**: 8

### Releases
- v2.1.12 (Jan 17) - Bug fix release
- v2.1.11 (Jan 17) - MCP connection fix
- v2.1.9 (Jan 16) - Multiple features
- v2.1.7 (Jan 14) - Security & features
- v2.1.6 (Jan 13) - Skill discovery & UI
- v2.1.5 (Jan 12) - Temp directory config
- v2.1.4 (Jan 11) - Background tasks control
- v2.1.3 (Jan 9) - Major: Merged commands & skills

### Most Significant Changes

**v2.1.9 (Jan 16)**
- `auto:N` syntax for MCP tool search - Fine-tune auto-enable threshold for MCP tools
- External editor support (Ctrl+G) - Use your preferred editor for complex inputs

**v2.1.7 (Jan 14)**
- Fixed wildcard permission rules security vulnerability - Critical security fix
- MCP tool search auto mode enabled by default - Improves tool discoverability

**v2.1.6 (Jan 13)**
- Automatic skill discovery from nested directories - Skills found automatically in subdirectories
- Context window percentage in status line - Better visibility into token usage

**v2.1.3 (Jan 9)**
- Merged slash commands and skills - Major simplification of the mental model
- Tool hook execution timeout increased to 10 minutes - Better support for long-running hooks

**v2.1.2 (Jan 9)**
- Fixed command injection vulnerability - Critical security fix in bash processing
- OSC 8 hyperlinks for file paths - Clickable file paths in supported terminals
```

## Notes

- List all releases in the period, even minor ones
- Most Significant Changes section highlights what users need to know
- Include multiple items per release when warranted
- Explain *why* each change is significant
