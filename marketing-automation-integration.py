#!/usr/bin/env python3
"""
Marketing Automation Website Integration
Connects your existing marketing automation system to the enhanced website
"""

import asyncio
import json
import os
import aiohttp
from datetime import datetime
from pathlib import Path
import yaml

class WebsiteIntegration:
    def __init__(self, config_path="../marketing-automation/config/website_automation.yaml"):
        self.config = self.load_config(config_path)
        self.website_url = self.config.get('website_url', 'https://untrapd.com')
        self.api_endpoints = {
            'kit_webhook': f"{self.website_url}/api/kit-webhook",
            'analytics': f"{self.website_url}/api/analytics-api",
            'content_sync': f"{self.website_url}/api/content-sync"
        }
        
    def load_config(self, config_path):
        """Load website automation configuration"""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            # Create default config if it doesn't exist
            default_config = {
                'website_url': 'https://untrapd.com',
                'content_optimization': {
                    'enabled': True,
                    'optimization_frequency': 'weekly',
                    'ab_test_duration': '7d',
                    'confidence_threshold': 0.95
                },
                'analytics_integration': {
                    'enabled': True,
                    'conversion_goals': ['email_signup', 'contact_form', 'shop_visit'],
                    'tracking_events': ['section_view', 'cta_click', 'form_start']
                },
                'email_automation': {
                    'enabled': True,
                    'segmentation': ['appfinder', 'etsy-shop', 'general'],
                    'welcome_sequence_delay': '1h'
                }
            }
            os.makedirs(os.path.dirname(config_path), exist_ok=True)
            with open(config_path, 'w') as f:
                yaml.dump(default_config, f)
            return default_config

    async def optimize_website_content(self, performance_data):
        """Generate optimized content based on performance data"""
        
        # Analyze performance metrics
        low_performing_sections = self.identify_optimization_opportunities(performance_data)
        
        optimization_tasks = []
        
        for section in low_performing_sections:
            if section['conversion_rate'] < self.config['content_optimization']['confidence_threshold']:
                # Generate content variations
                variations = await self.generate_content_variations(section)
                
                # Deploy A/B test
                ab_test_config = {
                    'test_name': f"optimize_{section['name']}_{datetime.now().strftime('%Y%m%d')}",
                    'variants': variations,
                    'traffic_split': {'control': 50, 'variant': 50},
                    'success_metric': 'conversion_rate',
                    'duration': self.config['content_optimization']['ab_test_duration']
                }
                
                optimization_tasks.append(self.deploy_ab_test(ab_test_config))
        
        # Execute all optimization tasks
        if optimization_tasks:
            results = await asyncio.gather(*optimization_tasks, return_exceptions=True)
            return {'optimizations_deployed': len(results), 'results': results}
        
        return {'message': 'No optimizations needed at this time'}

    async def generate_content_variations(self, section_data):
        """Use content agent to generate optimized variations"""
        
        # This would integrate with your existing content agent
        content_agent_prompt = f"""
        Optimize the {section_data['name']} section for better conversion rates.
        
        Current performance:
        - Conversion rate: {section_data['conversion_rate']:.2%}
        - Bounce rate: {section_data['bounce_rate']:.2%}
        - Time on section: {section_data['avg_time_on_section']}s
        
        Current content: {section_data['current_content']}
        
        Generate 2 improved variations focusing on:
        1. Clearer value proposition
        2. Stronger call-to-action
        3. Better emotional connection
        
        Target audience: {section_data['target_audience']}
        Business goals: {section_data['business_goals']}
        """
        
        # Simulate content agent response (integrate with your actual agent)
        variations = [
            {
                'variant_id': 'A',
                'headline': f"Enhanced {section_data['name']} - Variant A",
                'content': f"Optimized content for {section_data['name']} with improved value proposition",
                'cta_text': "Get Started Now",
                'optimization_reasoning': "Focused on urgency and clear benefits"
            },
            {
                'variant_id': 'B',
                'headline': f"Enhanced {section_data['name']} - Variant B", 
                'content': f"Alternative optimized content for {section_data['name']} with emotional appeal",
                'cta_text': "Join the Community",
                'optimization_reasoning': "Emphasized community and belonging"
            }
        ]
        
        return variations

    async def deploy_ab_test(self, test_config):
        """Deploy A/B test to website"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_endpoints['content_sync'],
                    json={
                        'action': 'deploy_ab_test',
                        'data': test_config
                    },
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200:
                        return {
                            'success': True,
                            'test_id': result.get('test_id'),
                            'test_url': result.get('test_url'),
                            'message': f"A/B test '{test_config['test_name']}' deployed successfully"
                        }
                    else:
                        return {
                            'success': False,
                            'error': f"Failed to deploy A/B test: {result.get('error', 'Unknown error')}"
                        }
                        
        except Exception as e:
            return {
                'success': False,
                'error': f"A/B test deployment failed: {str(e)}"
            }

    async def sync_email_automation(self, subscriber_data):
        """Sync new subscriber data with email automation"""
        
        try:
            # Determine segmentation based on subscriber interests
            segments = self.determine_segments(subscriber_data)
            
            # Create automated email sequence
            automation_config = {
                'subscriber_id': subscriber_data['email'],
                'segments': segments,
                'welcome_sequence': self.get_welcome_sequence(segments),
                'personalization': {
                    'interests': subscriber_data.get('interests', []),
                    'source': subscriber_data.get('source', 'website'),
                    'signup_date': datetime.now().isoformat()
                }
            }
            
            # Trigger email automation
            return await self.trigger_email_sequence(automation_config)
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Email automation sync failed: {str(e)}"
            }

    def determine_segments(self, subscriber_data):
        """Determine email segments based on subscriber interests"""
        
        segments = ['general']  # Default segment
        interests = subscriber_data.get('interests', [])
        
        if 'appfinder' in interests:
            segments.append('appfinder_prelaunch')
        if 'etsy-shop' in interests:
            segments.append('etsy_customers')
        if subscriber_data.get('source') == 'contact_form':
            segments.append('high_intent_leads')
            
        return segments

    def get_welcome_sequence(self, segments):
        """Get appropriate welcome email sequence"""
        
        sequences = {
            'appfinder_prelaunch': [
                {
                    'delay': '1h',
                    'template': 'appfinder_welcome',
                    'subject': 'Welcome to the AppFinder journey! 🚀'
                },
                {
                    'delay': '3d',
                    'template': 'appfinder_behind_scenes',
                    'subject': 'Behind the scenes of AppFinder development'
                },
                {
                    'delay': '1w',
                    'template': 'appfinder_exclusive_preview',
                    'subject': 'Exclusive AppFinder preview just for you'
                }
            ],
            'etsy_customers': [
                {
                    'delay': '1h',
                    'template': 'shop_welcome',
                    'subject': 'Welcome to SuperHyperCar Designs! 🏎️'
                },
                {
                    'delay': '2d',
                    'template': 'shop_featured_designs',
                    'subject': 'Featured supercar designs this week'
                },
                {
                    'delay': '1w',
                    'template': 'shop_exclusive_discount',
                    'subject': 'Exclusive 15% discount for subscribers'
                }
            ],
            'general': [
                {
                    'delay': '1h',
                    'template': 'general_welcome',
                    'subject': 'Welcome to Untrapd - Innovation Awaits! ✨'
                },
                {
                    'delay': '3d',
                    'template': 'general_products_overview',
                    'subject': 'Discover our innovative products'
                }
            ]
        }
        
        # Combine sequences based on segments
        welcome_sequence = []
        for segment in segments:
            if segment in sequences:
                welcome_sequence.extend(sequences[segment])
                
        return welcome_sequence

    async def trigger_email_sequence(self, automation_config):
        """Trigger email automation sequence"""
        
        # This would integrate with your email service (Kit/ConvertKit)
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_endpoints['kit_webhook'],
                    json={
                        'email': automation_config['subscriber_id'],
                        'source': 'automation_trigger',
                        'automation_config': automation_config
                    },
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    result = await response.json()
                    
                    return {
                        'success': response.status == 200,
                        'automation_triggered': True,
                        'sequences_scheduled': len(automation_config['welcome_sequence']),
                        'result': result
                    }
                    
        except Exception as e:
            return {
                'success': False,
                'error': f"Email sequence trigger failed: {str(e)}"
            }

    async def get_conversion_insights(self, timeframe='7d'):
        """Get conversion insights from website analytics"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_endpoints['analytics']}/conversion-data",
                    params={'timeframe': timeframe}
                ) as response:
                    insights = await response.json()
                    
                    return {
                        'success': True,
                        'insights': insights,
                        'recommendations': self.generate_optimization_recommendations(insights)
                    }
                    
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to get conversion insights: {str(e)}"
            }

    def generate_optimization_recommendations(self, insights):
        """Generate actionable optimization recommendations"""
        
        recommendations = []
        metrics = insights.get('metrics', {})
        
        # Conversion rate recommendations
        if metrics.get('conversion_rate', 0) < 0.05:  # Less than 5%
            recommendations.append({
                'type': 'conversion_optimization',
                'priority': 'high',
                'suggestion': 'Conversion rate is below 5%. Consider A/B testing the newsletter signup placement and CTA text.',
                'expected_impact': '20-40% improvement',
                'implementation': 'deploy_ab_test'
            })
        
        # Bounce rate recommendations
        if metrics.get('bounce_rate', 0) > 0.6:  # Greater than 60%
            recommendations.append({
                'type': 'engagement_optimization',
                'priority': 'high',
                'suggestion': 'High bounce rate indicates visitors aren\'t finding what they expect. Review page loading speed and hero section clarity.',
                'expected_impact': '15-25% bounce rate reduction',
                'implementation': 'content_optimization'
            })
        
        # Traffic source recommendations
        top_sources = metrics.get('top_sources', [])
        if top_sources:
            low_converting_sources = [s for s in top_sources if s.get('conversions', 0) / s.get('visitors', 1) < 0.03]
            if low_converting_sources:
                recommendations.append({
                    'type': 'traffic_optimization',
                    'priority': 'medium',
                    'suggestion': f"Traffic from {[s['source'] for s in low_converting_sources]} has low conversion rates. Consider creating targeted landing pages.",
                    'expected_impact': '30-50% conversion improvement for those sources',
                    'implementation': 'targeted_content'
                })
        
        return recommendations

    def identify_optimization_opportunities(self, performance_data):
        """Identify sections that need optimization"""
        
        opportunities = []
        
        for section, data in performance_data.items():
            if isinstance(data, dict):
                conversion_rate = data.get('conversion_rate', 0)
                bounce_rate = data.get('bounce_rate', 0)
                avg_time = data.get('avg_time_on_section', 0)
                
                # Identify low-performing sections
                if conversion_rate < 0.05 or bounce_rate > 0.7 or avg_time < 30:
                    opportunities.append({
                        'name': section,
                        'conversion_rate': conversion_rate,
                        'bounce_rate': bounce_rate,
                        'avg_time_on_section': avg_time,
                        'current_content': data.get('content_preview', ''),
                        'target_audience': data.get('target_audience', 'general'),
                        'business_goals': data.get('business_goals', ['engagement', 'conversion'])
                    })
        
        return sorted(opportunities, key=lambda x: x['conversion_rate'])

    async def run_weekly_optimization(self):
        """Run weekly optimization routine"""
        
        print("🚀 Starting weekly website optimization...")
        
        # Get performance insights
        insights_result = await self.get_conversion_insights('7d')
        
        if insights_result['success']:
            insights = insights_result['insights']
            
            # Generate and deploy optimizations
            optimization_result = await self.optimize_website_content(insights)
            
            # Generate report
            report = {
                'timestamp': datetime.now().isoformat(),
                'timeframe': '7d',
                'insights': insights,
                'optimizations': optimization_result,
                'recommendations': insights_result.get('recommendations', [])
            }
            
            # Save report
            report_path = f"../marketing-automation/data/analytics/reports/weekly_optimization_{datetime.now().strftime('%Y%m%d')}.json"
            os.makedirs(os.path.dirname(report_path), exist_ok=True)
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2)
            
            print(f"✅ Weekly optimization completed. Report saved to {report_path}")
            return report
        else:
            print(f"❌ Failed to get insights: {insights_result['error']}")
            return None

# Integration function for your existing marketing automation system
async def integrate_with_website():
    """Main integration function"""
    
    integration = WebsiteIntegration()
    
    # Run weekly optimization
    optimization_result = await integration.run_weekly_optimization()
    
    if optimization_result:
        print("\n📊 Optimization Summary:")
        print(f"- Optimizations deployed: {optimization_result['optimizations'].get('optimizations_deployed', 0)}")
        print(f"- Recommendations generated: {len(optimization_result['recommendations'])}")
        print(f"- Report timestamp: {optimization_result['timestamp']}")
    
    return optimization_result

if __name__ == "__main__":
    # Run the integration
    result = asyncio.run(integrate_with_website())
    print("\n🎯 Website integration completed successfully!")