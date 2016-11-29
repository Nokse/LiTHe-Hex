import sys
import math
import communication

# types of corridors
CORRIDOR = 0
DEAD_END = 1
MAYBE_CORRIDOR = 2 # when front sensor has detected a corridor but back has yet not

# commands
GO_FORWARD = 0
TURN_LEFT = 1
TURN_RIGHT = 2
STOP = 3
CLIMB_OBSTACLE = 4

# general directions
FRONT = 0
LEFT = 1
RIGHT = 2

# distances to different objects in meters
DEAD_END_DISTANCE = 1
DISTANCE_TO_OBSTACLE = 0.0

# distance between the sensors in the mount on same side
DISTANCE_BETWEEN_SENSORS = 0.16

previous_decision = GO_FORWARD


def _get_corridors_and_dead_ends(sensor_data):
    """
    Returns the dead ends and corridors detected in the maze
    """
    corridors_and_dead_ends = [DEAD_END, DEAD_END, DEAD_END]

    if (sensor_data.lidar >= DEAD_END_DISTANCE):
        corridors_and_dead_ends[FRONT] = CORRIDOR
    else:
        corridors_and_dead_ends[FRONT] = DEAD_END

    if (sensor_data.ir_front_left >= DEAD_END_DISTANCE):
        # front left sensor detects a long distance to wall
        corridors_and_dead_ends[LEFT] = MAYBE_CORRIDOR

        # check if back sensor also detects long distance
        if (sensor_data.ir_back_left >= DEAD_END_DISTANCE and
            corridors_and_dead_ends[LEFT] == MAYBE_CORRIDOR):
            corridors_and_dead_ends[LEFT] = CORRIDOR

    else:
        corridors_and_dead_ends[LEFT] = DEAD_END

    if (sensor_data.ir_front_right >= DEAD_END_DISTANCE):
        # front right sensor detects long distance to wall
        corridors_and_dead_ends[RIGHT] = MAYBE_CORRIDOR

        # check if back sensor also detects long distance
        if (sensor_data.ir_back_right >= DEAD_END_DISTANCE and
            corridors_and_dead_ends[RIGHT] == MAYBE_CORRIDOR):
            corridors_and_dead_ends[RIGHT] = CORRIDOR

    else:
        corridors_and_dead_ends[RIGHT] = DEAD_END

    print(corridors_and_dead_ends)
    return corridors_and_dead_ends


def _found_obstacle(sensor_data):
    """
    Returns whether an obstacle has been detected or not
    """
    obstacle_found = False
    if (sensor_data.ir_down <= DISTANCE_TO_OBSTACLE):
        obstacle_found = True
    else:
        obstacle_found = False
    return obstacle_found


def _expected_path(corridors_and_dead_ends, front, left, right):
    if (corridors_and_dead_ends[FRONT] == front and
        corridors_and_dead_ends[LEFT] == left and
        corridors_and_dead_ends[RIGHT] == right):
        return True
    else:
        return False


def get_decision(sensor_data):
    """
    Returns the decision made based on the dead ends and corridors detected
    """

    corridors_and_dead_ends = _get_corridors_and_dead_ends(sensor_data)

    # robot will always move forward until it detects a dead end forward
    decision = GO_FORWARD;

    if (_found_obstacle(sensor_data)):
        decision = CLIMB_OBSTACLE

    else:

        for value in corridors_and_dead_ends:
            # if more than one corridor to choose from
            if (corridors_and_dead_ends.count(CORRIDOR) > 1):
                print("Maze too complicated")

            else:
                if (_expected_path(corridors_and_dead_ends, DEAD_END, CORRIDOR, DEAD_END)):
                    decision = TURN_LEFT

                elif (_expected_path(corridors_and_dead_ends, DEAD_END, DEAD_END, CORRIDOR)):
                    decision = TURN_RIGHT

                elif (_expected_path(corridors_and_dead_ends, DEAD_END, DEAD_END, DEAD_END)):
                    decision = STOP

                else:
                    decision = GO_FORWARD

    """
    Check if previous decision was to make a turn.
    If it was we need to let the robot make a full turn before using
    the sensor data because they will give bad values during a turn.
    """
    if (previous_decision == TURN_LEFT):
        print("Robot is turning left!")

        """
        After the robot has started turning the angle will be
        larger than 5 (0 ideally), so we don't make new decisions until
        the robot is back at straight angle.
        """
        if (sensor_data.right_angle <= 5): #TODO: test and tweak this
            decision = GO_FORWARD
            print("The robot has made a turn!")

    """
    Check if previous decision was to make a turn.
    If it was we need to let the robot make a full turn before using
    the sensor data because they will give bad values during a turn.
    """
    if (previous_decision == TURN_RIGHT):
        print("Robot is turning left!")

        """
        After the robot has started turning the angle will be
        larger than 5 (0 ideally), so we don't make new decisions until
        the robot is back at straight angle.
        """
        if (sensor_data.left_angle <= 5): #TODO: test and tweak this
            decision = GO_FORWARD
            print("The robot has made a turn!")

    return decision
