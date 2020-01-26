#Hawk Log
##Overview
This project is an effort to update the existing Global Hawk Mission Log to a web-based client.  This would move the program away from reliance on Microsoft Access interface.  Using a web client reduces compatibility issues with different office versions and allows seamless feature additions.  The web interface is designed to use the existing SQL Server database through a PHP-based API to store log entries and allows more flexible display, allowing the expansion of the database design to more fully represent critical metrics for a wider range of mission sets.

##Background
The Global Hawk Mission Log tracks key flight metrics and acts as a passdown report for aircrew working across mutliple shifts.  Remote aircraft have the capabilities to stay airborne for much longer than a single crew's duty day, necessitating shifts to changeover mid-flight.  A consistent log that aids in tracking important flight events enables better crew situational awareness and communication.

##Objectives
-Unify logging for all Global Hawk mission sets
-Move away from reliance of Microsoft Office
--Eliminate Office-based compatibility issues
--Allow seamless updates and feature additions
-Enable wider access to log from multiple locations
-Incorporate permissions groups to control access and inputs
