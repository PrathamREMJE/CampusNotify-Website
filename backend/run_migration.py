#!/usr/bin/env python
"""
Script to run migrations and start the Django server
"""
import os
import sys
import subprocess

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Django Migration and Server Setup")
    print("=" * 50)
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Activate virtual environment and run migrations
    commands = [
        (".venv\\Scripts\\activate && python manage.py migrate", "Running database migrations"),
        (".venv\\Scripts\\activate && python manage.py collectstatic --noinput", "Collecting static files"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print(f"\n❌ Setup failed at: {description}")
            return
    
    print("\n✅ All migrations completed successfully!")
    print("\n🎉 You can now start the Django server with:")
    print("   .venv\\Scripts\\activate && python manage.py runserver")
    
    # Ask if user wants to start the server
    start_server = input("\n🤔 Do you want to start the server now? (y/n): ").lower().strip()
    if start_server in ['y', 'yes']:
        print("\n🚀 Starting Django development server...")
        os.system(".venv\\Scripts\\activate && python manage.py runserver")

if __name__ == "__main__":
    main()