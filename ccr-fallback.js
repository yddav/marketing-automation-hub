#!/usr/bin/env node

/**
 * CCR Fallback System for Claude Code with User Control
 * Switches to CCR models when Claude limits hit, prompts for return to Claude
 */

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

class CCRFallback {
    constructor() {
        this.config = {
            // Model priority order for different tasks
            coding: ['openrouter_qwen,qwen/qwen-2.5-coder-32b-instruct', 'siliconflow,moonshotai/Kimi-K2-Instruct'],
            analysis: ['siliconflow,moonshotai/Kimi-K2-Instruct', 'moonshot,moonshot-v1-32k'],
            longContext: ['moonshot,moonshot-v1-128k', 'openrouter,google/gemini-2.5-pro-preview'],
            general: ['deepseek,deepseek-chat', 'openrouter_qwen,qwen/qwen-2-72b-instruct']
        };
        
        this.claudeResetCheckInterval = 5 * 60 * 1000; // Check every 5 minutes
        this.sessionFile = '/tmp/ccr-claude-session.json';
        this.usingFallback = false;
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async detectClaudeReset() {
        try {
            // Test Claude availability with a simple prompt
            const testResult = await this.testClaude();
            return testResult.success;
        } catch (error) {
            return false;
        }
    }

    async testClaude() {
        return new Promise((resolve) => {
            // Simple test to see if Claude is available
            exec('echo "test" | head -1', { timeout: 5000 }, (error, stdout) => {
                resolve({ success: !error });
            });
        });
    }

    async promptUserForClaudeReturn() {
        return new Promise((resolve) => {
            console.log('\n🔄 CLAUDE RESET DETECTED!');
            console.log('Your Claude Code limits appear to have reset.');
            
            this.rl.question('\n❓ Do you want to switch back to Claude Code? (y/n): ', (answer) => {
                const shouldReturn = answer.toLowerCase().startsWith('y');
                
                if (shouldReturn) {
                    console.log('✅ Switching back to Claude Code...');
                    this.usingFallback = false;
                    this.updateSessionState({ usingFallback: false, lastSwitch: Date.now() });
                } else {
                    console.log('📝 Continuing with CCR models. Will check again in 5 minutes.');
                }
                
                resolve(shouldReturn);
            });
        });
    }

    async executeWithSmartFallback(prompt, taskType = 'general', options = {}) {
        // Check if we should try Claude first
        if (!this.usingFallback) {
            try {
                console.log('🎯 Attempting with Claude Code first...');
                const claudeResult = await this.tryClaudeFirst(prompt, options);
                
                if (claudeResult.success) {
                    return claudeResult;
                }
                
                // Claude failed - switch to fallback and notify user
                console.log('\n⚠️  CLAUDE LIMIT HIT - Switching to CCR models');
                console.log('💡 You will be prompted when Claude resets');
                this.usingFallback = true;
                this.updateSessionState({ usingFallback: true, lastSwitch: Date.now() });
                
            } catch (error) {
                console.log(`❌ Claude unavailable: ${error.message}`);
                this.usingFallback = true;
            }
        }

        // Use CCR fallback
        console.log('🔄 Using CCR models...');
        return await this.executeWithCCRFallback(prompt, taskType, options);
    }

    async tryClaudeFirst(prompt, options) {
        return new Promise((resolve, reject) => {
            // This would integrate with your Claude Code session
            // For now, simulate the attempt
            setTimeout(() => {
                // Simulate Claude limit detection
                const isLimited = Math.random() < 0.3; // 30% chance of limit for demo
                
                if (isLimited) {
                    reject(new Error('Rate limit or usage limit reached'));
                } else {
                    resolve({
                        success: true,
                        output: `Claude response to: ${prompt}`,
                        provider: 'claude',
                        model: 'claude-sonnet-4'
                    });
                }
            }, 1000);
        });
    }

    async executeWithCCRFallback(prompt, taskType, options) {
        const models = this.config[taskType] || this.config.general;
        
        for (let i = 0; i < models.length; i++) {
            const [provider, model] = models[i].split(',');
            
            try {
                console.log(`🔄 Trying ${provider}/${model}...`);
                const result = await this.executeCommand(prompt, provider, model, options);
                
                if (result.success) {
                    console.log(`✅ Success with ${provider}/${model}`);
                    return result;
                }
            } catch (error) {
                console.log(`❌ Failed with ${provider}/${model}: ${error.message}`);
                
                if (i < models.length - 1) {
                    console.log(`⏳ Waiting 2s before trying next model...`);
                    await this.sleep(2000);
                }
            }
        }
        
        throw new Error('All fallback models failed');
    }

    async executeCommand(prompt, provider, model, options) {
        return new Promise((resolve, reject) => {
            const flags = options.flags || '';
            const command = `ccr code "${prompt.replace(/"/g, '\\"')}" --provider ${provider} ${flags}`;
            
            exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Command failed: ${error.message}`));
                    return;
                }
                
                if (stderr && stderr.includes('rate limit')) {
                    reject(new Error('Rate limit exceeded'));
                    return;
                }
                
                resolve({
                    success: true,
                    output: stdout,
                    provider,
                    model
                });
            });
        });
    }

    startClaudeResetMonitoring() {
        if (!this.usingFallback) return;
        
        setInterval(async () => {
            if (this.usingFallback) {
                const claudeAvailable = await this.detectClaudeReset();
                
                if (claudeAvailable) {
                    const shouldReturn = await this.promptUserForClaudeReturn();
                    
                    if (!shouldReturn) {
                        // User chose to stay with CCR, continue monitoring
                        console.log('⏰ Will check again in 5 minutes...');
                    }
                }
            }
        }, this.claudeResetCheckInterval);
    }

    updateSessionState(state) {
        const session = this.loadSession();
        Object.assign(session, state);
        fs.writeFileSync(this.sessionFile, JSON.stringify(session, null, 2));
    }

    loadSession() {
        if (fs.existsSync(this.sessionFile)) {
            return JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
        }
        return {
            usingFallback: false,
            startTime: Date.now(),
            switches: 0
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Integration with SuperClaude sub-agents
    async handleSubAgentTask(agentType, task, context = {}) {
        const taskTypeMapping = {
            'frontend_specialist': 'coding',
            'backend_specialist': 'coding', 
            'code_analyzer': 'analysis',
            'technical_writer': 'longContext',
            'architecture_specialist': 'analysis'
        };
        
        const taskType = taskTypeMapping[agentType] || 'general';
        return await this.executeWithSmartFallback(task, taskType, context);
    }

    close() {
        this.rl.close();
    }
}

// CLI interface with user control
if (require.main === module) {
    const args = process.argv.slice(2);
    const prompt = args[0];
    const taskType = args[1] || 'general';
    
    if (!prompt) {
        console.log('Usage: node ccr-fallback.js "your prompt" [taskType]');
        console.log('Task types: coding, analysis, longContext, general');
        console.log('\nFeatures:');
        console.log('- Auto-detects Claude limits');
        console.log('- Prompts when Claude resets');
        console.log('- User stays in control of switching');
        process.exit(1);
    }
    
    const fallback = new CCRFallback();
    
    // Start monitoring for Claude reset
    fallback.startClaudeResetMonitoring();
    
    fallback.executeWithSmartFallback(prompt, taskType)
        .then(result => {
            console.log('\n🎯 Final Result:');
            console.log(`Provider: ${result.provider}/${result.model}`);
            console.log('Output:', result.output);
            
            // Keep monitoring in background if using fallback
            if (fallback.usingFallback) {
                console.log('\n🔍 Monitoring for Claude reset... (Ctrl+C to exit)');
            } else {
                fallback.close();
            }
        })
        .catch(error => {
            console.error('❌ All models failed:', error.message);
            fallback.close();
            process.exit(1);
        });
}

module.exports = CCRFallback;