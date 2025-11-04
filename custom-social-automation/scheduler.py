"""
Scheduler Service - Custom Social Media Automation Platform
APScheduler-based job scheduling for automated posting
Created: 2025-10-29
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
import logging
from models import db
from platform_apis import post_to_platforms
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PostScheduler:
    """APScheduler-based automated posting service"""

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        logger.info("PostScheduler initialized")

        # Schedule periodic checks for due posts
        self.scheduler.add_job(
            self.check_and_post_due,
            IntervalTrigger(minutes=1),
            id='check_due_posts',
            name='Check for posts due to be published',
            replace_existing=True
        )
        logger.info("Scheduled periodic checks every 1 minute")

    def check_and_post_due(self):
        """Check for posts that are due and post them"""
        try:
            due_posts = db.get_posts_due_now()

            if not due_posts:
                logger.debug("No posts due at this time")
                return

            logger.info(f"Found {len(due_posts)} posts due for posting")

            for post in due_posts:
                try:
                    self.post_content(post)
                except Exception as e:
                    logger.error(f"Failed to post {post['id']}: {str(e)}")
                    db.mark_post_failed(post['id'], str(e))

        except Exception as e:
            logger.error(f"Error in check_and_post_due: {str(e)}")

    def post_content(self, post):
        """Post content to scheduled platforms"""
        logger.info(f"Posting content: {post['id']} to {post['platforms']}")

        try:
            # Post to all scheduled platforms
            results = post_to_platforms(
                text=post['text'],
                image_url=post.get('image_url'),
                platforms=post['platforms']
            )

            # Check if all platforms succeeded
            all_success = all(r['success'] for r in results.values())

            if all_success:
                logger.info(f"Successfully posted {post['id']} to all platforms")
                db.mark_post_posted(post['id'], results)
            else:
                failed_platforms = [p for p, r in results.items() if not r['success']]
                error_msg = f"Failed on platforms: {', '.join(failed_platforms)}"
                logger.warning(f"Partial failure for post {post['id']}: {error_msg}")

                # Mark as posted with partial success
                db.mark_post_posted(post['id'], results)

        except Exception as e:
            logger.error(f"Error posting {post['id']}: {str(e)}")
            db.mark_post_failed(post['id'], str(e))
            raise

    def schedule_post(self, post_id, scheduled_datetime):
        """Schedule a specific post for a future time"""
        try:
            post = db.get_post(post_id)
            if not post:
                raise ValueError(f"Post {post_id} not found")

            # Add job to scheduler
            self.scheduler.add_job(
                self.post_content,
                trigger='date',
                run_date=scheduled_datetime,
                args=[post],
                id=f'post_{post_id}',
                name=f'Post {post_id}',
                replace_existing=True
            )

            logger.info(f"Scheduled post {post_id} for {scheduled_datetime}")

            # Update post status
            db.update_post(post_id, status='scheduled')

        except Exception as e:
            logger.error(f"Error scheduling post {post_id}: {str(e)}")
            raise

    def cancel_post(self, post_id):
        """Cancel a scheduled post"""
        try:
            job_id = f'post_{post_id}'

            if self.scheduler.get_job(job_id):
                self.scheduler.remove_job(job_id)
                logger.info(f"Cancelled scheduled post {post_id}")

                # Update post status
                db.update_post(post_id, status='draft')
            else:
                logger.warning(f"No scheduled job found for post {post_id}")

        except Exception as e:
            logger.error(f"Error cancelling post {post_id}: {str(e)}")
            raise

    def reschedule_post(self, post_id, new_datetime):
        """Reschedule an existing post"""
        try:
            self.cancel_post(post_id)
            self.schedule_post(post_id, new_datetime)
            logger.info(f"Rescheduled post {post_id} to {new_datetime}")

        except Exception as e:
            logger.error(f"Error rescheduling post {post_id}: {str(e)}")
            raise

    def get_scheduled_jobs(self):
        """Get all currently scheduled jobs"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run': job.next_run_time,
                'trigger': str(job.trigger)
            })
        return jobs

    def shutdown(self):
        """Gracefully shutdown the scheduler"""
        logger.info("Shutting down scheduler")
        self.scheduler.shutdown(wait=True)
        logger.info("Scheduler shut down successfully")

# Singleton instance
scheduler = PostScheduler()

if __name__ == '__main__':
    # Keep the scheduler running
    try:
        logger.info("Scheduler service started")
        print("✅ Scheduler running. Press Ctrl+C to stop.")

        # Keep the script running
        import time
        while True:
            time.sleep(1)

    except (KeyboardInterrupt, SystemExit):
        logger.info("Received shutdown signal")
        scheduler.shutdown()
