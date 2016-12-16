module App exposing (..)

import Html exposing (Html, h1, img, text, div, input, br, form)
import Html.Attributes exposing (style, value, src, placeholder)
import Html.Lazy exposing (lazy)
import Json.Encode as JE
import Json.Decode as JD
import Json.Decode.Pipeline exposing (decode, required)
import Time exposing (Time, millisecond)
import Dict exposing (Dict)
import String
import Debug
import Keyboard
import Phoenix.Socket exposing (Socket)
import Phoenix.Channel
import Phoenix.Push
import Material
import Material.Elevation as Elevation
import Material.Textfield as Textfield
import Material.List as Lists
import Material.Button as Button
import Material.Card as Card
import Material.Toggles as Toggles
import Material.Slider as Slider
import Material.Layout as Layout
import Joystick
import Sensors
import KeyCode as KC


{-
   Copyright 2016 Noak Ringman, Emil Segerbäck, Robin Sliwa, Frans Skarman, Hannes Tuhkala, Malcolm Wigren, Olav Övrebö

   This file is part of LiTHe Hex.

   LiTHe Hex is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   LiTHe Hex is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with LiTHe Hex.  If not, see <http://www.gnu.org/licenses/>.
-}


type alias PIDParameter =
    String


type Msg
    = PhoenixMsg (Phoenix.Socket.Msg Msg)
    | ReceiveChatMessage JE.Value
    | GamepadConnected Int
    | GamepadDisconnected Int
    | AxisData Joystick.JoystickData
    | UpdateControlDisplay Time
    | SendControlToServer Time
    | SelectTab Int
    | ChangeParameter PIDParameter String
    | SendParameters
    | ToggleAuto
    | MoveSlider Keyboard.KeyCode
    | ResetBot
    | Mdl (Material.Msg Msg)


type alias Model =
    { phxSocket : Socket Msg
    , messages : List String
    , joystick : Joystick.JoystickData
    , joystickIndex : Maybe Int
    , sensorData : List Sensors.SensorData
    , autoMode : Bool
    , selectedTab : Int
    , parameters : Dict String Float
    , mdl : Material.Model
    }


type BotMessage
    = DebugMessage String
    | AutoMessage Bool
    | SensorMessage Sensors.SensorData


type alias Flags =
    { host : String }


initialJoystick : Joystick.JoystickData
initialJoystick =
    { x = 0, y = 0, rotation = 0, thrust = 1, reset = False }


init : Flags -> ( Model, Cmd Msg )
init { host } =
    let
        ( phxSocket, phxCmd ) =
            Phoenix.Socket.init ("ws://" ++ host ++ "/socket/websocket")
                |> Phoenix.Socket.withDebug
                |> Phoenix.Socket.on "new_msg" "client" ReceiveChatMessage
                |> Phoenix.Socket.join (Phoenix.Channel.init "client")
    in
        { phxSocket = phxSocket
        , messages = []
        , joystick = initialJoystick
        , joystickIndex = Nothing
        , sensorData = []
        , autoMode = False
        , selectedTab = 0
        , parameters = Dict.empty
        , mdl = Material.model
        }
            ! [ Cmd.map PhoenixMsg phxCmd ]


{-| Decodes a debug message from the robot
-}
debugMessageDecoder : JD.Decoder BotMessage
debugMessageDecoder =
    JD.map DebugMessage
        (JD.field "debug" JD.string)


{-| Decodes a message about changing between manual and autonomous mode
-}
autoMessageDecoder : JD.Decoder BotMessage
autoMessageDecoder =
    JD.map AutoMessage
        (JD.field "auto" JD.bool)


{-| Decodes a message with new debug data
-}
sensorMessageDecoder : JD.Decoder BotMessage
sensorMessageDecoder =
    decode (Sensors.SensorData)
        |> required "ir_down" JD.float
        |> required "ir_fl" JD.float
        |> required "ir_fr" JD.float
        |> required "ir_bl" JD.float
        |> required "ir_br" JD.float
        |> required "lidar" JD.float
        |> required "angle_l" JD.float
        |> required "angle_r" JD.float
        |> required "angle_avg" JD.float
        |> JD.map SensorMessage


{-| Checks what kind of message has been received and decodes it
-}
serverMessageDecoder : JD.Decoder BotMessage
serverMessageDecoder =
    JD.oneOf [ debugMessageDecoder, autoMessageDecoder, sensorMessageDecoder ]


{-| Send a message to the robot about joystick state, auto mode or PID parameters
-}
sendControlMessage : Socket Msg -> JE.Value -> ( Socket Msg, Cmd Msg )
sendControlMessage socket payload =
    let
        push =
            Phoenix.Push.init "joystick" "client"
                |> Phoenix.Push.withPayload payload

        ( phxSocket, phxCmd ) =
            Phoenix.Socket.push push socket
    in
        ( phxSocket, Cmd.map PhoenixMsg phxCmd )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PhoenixMsg phxMsg ->
            let
                ( phxSocket, phxCmd ) =
                    Phoenix.Socket.update phxMsg model.phxSocket
            in
                ( { model | phxSocket = phxSocket }
                , Cmd.map PhoenixMsg phxCmd
                )

        Mdl mdlMsg ->
            Material.update mdlMsg model

        ReceiveChatMessage raw ->
            case JD.decodeValue serverMessageDecoder raw of
                Ok (DebugMessage msg) ->
                    ( { model | messages = List.take 30 (msg :: model.messages) }
                    , Cmd.none
                    )

                Ok (AutoMessage enabled) ->
                    let
                        _ =
                            Debug.log "Auto mode set to " enabled
                    in
                        ( { model | autoMode = enabled }
                        , Cmd.none
                        )

                Ok (SensorMessage sensorData) ->
                    let
                        newData =
                            (sensorData :: model.sensorData)
                                |> List.take (5 * Sensors.sensorMessagesPerSecond)
                    in
                        ( { model | sensorData = newData }
                        , Cmd.none
                        )

                Err error ->
                    ( model, Cmd.none )

        UpdateControlDisplay _ ->
            case model.joystickIndex of
                Nothing ->
                    ( model, Cmd.none )

                Just index ->
                    ( model, Joystick.poll index )

        SendControlToServer _ ->
            let
                ( phxSocket, phxCmd ) =
                    sendControlMessage model.phxSocket
                        <| JE.object
                            [ ( "x", JE.float model.joystick.x )
                            , ( "y", JE.float model.joystick.y )
                            , ( "rotation", JE.float (-1 * model.joystick.rotation) )
                            , ( "thrust", JE.float model.joystick.thrust )
                            ]
            in
                ( { model | phxSocket = phxSocket }
                , phxCmd
                )

        GamepadConnected index ->
            ( { model | joystickIndex = Just index }, Cmd.none )

        GamepadDisconnected index ->
            if Just index == model.joystickIndex then
                ( { model | joystickIndex = Nothing }, Cmd.none )
            else
                ( model, Cmd.none )

        AxisData data ->
            let
                ( phxSocket, phxCmd ) =
                    if data.reset && not model.joystick.reset then
                        sendControlMessage model.phxSocket
                            (JE.object [ ( "reset", JE.bool True ) ])
                    else
                        ( model.phxSocket, Cmd.none )
            in
                ( { model | phxSocket = phxSocket, joystick = data }, phxCmd )

        ResetBot ->
            let
                ( phxSocket, phxCmd ) =
                    sendControlMessage model.phxSocket
                        (JE.object [ ( "reset", JE.bool True ) ])
            in
                ( { model | phxSocket = phxSocket }, phxCmd )

        SelectTab num ->
            ( { model | selectedTab = num }, Cmd.none )

        ChangeParameter par value ->
            case String.toFloat value of
                Err msg ->
                    let
                        _ =
                            Debug.log "ERROR Could not parse text field value as float: "
                                msg

                        newParameters =
                            Dict.remove par model.parameters
                    in
                        ( { model | parameters = newParameters }, Cmd.none )

                Ok res ->
                    let
                        newParameters =
                            Dict.insert par res model.parameters
                    in
                        ( { model | parameters = newParameters }
                        , Cmd.none
                        )

        SendParameters ->
            let
                payload =
                    Dict.toList model.parameters
                        |> List.map (\( par, v ) -> ( par, JE.float v ))
                        |> JE.object

                ( phxSocket, phxCmd ) =
                    sendControlMessage model.phxSocket payload
            in
                ( { model
                    | phxSocket = phxSocket
                  }
                , phxCmd
                )

        ToggleAuto ->
            let
                ( phxSocket, phxCmd ) =
                    sendControlMessage model.phxSocket
                        <| JE.object [ ( "auto", JE.bool (not model.autoMode) ) ]
            in
                ( { model
                    | autoMode = not model.autoMode
                    , phxSocket = phxSocket
                  }
                , phxCmd
                )

        MoveSlider keyCode ->
            let
                keyDiff decKey incKey =
                    if keyCode == decKey then
                        -10
                    else if keyCode == incKey then
                        10
                    else
                        0

                joy =
                    model.joystick

                slide ( minv, maxv ) oldv ( decKey, incKey ) =
                    (oldv * 100)
                        + keyDiff decKey incKey
                        |> clamp (minv * 100) (maxv * 100)
                        |> \v -> v / 100
            in
                ( { model
                    | joystick =
                        { joy
                            | x = slide ( -1, 1 ) joy.x ( KC.a, KC.d )
                            , y = slide ( -1, 1 ) joy.y ( KC.s, KC.w )
                            , rotation = slide ( -1, 1 ) joy.rotation ( KC.q, KC.e )
                            , thrust = slide ( 0, 1 ) joy.thrust ( KC.c, KC.r )
                        }
                  }
                , Cmd.none
                )


subscriptions : Model -> Sub Msg
subscriptions model =
    [ Phoenix.Socket.listen model.phxSocket PhoenixMsg
    , Joystick.axisData AxisData
    , Joystick.connected GamepadConnected
    , Joystick.disconnected GamepadDisconnected
    , Time.every (millisecond * 10) UpdateControlDisplay
    , Time.every (millisecond * 500) SendControlToServer
    , Keyboard.downs MoveSlider
    ]
        |> Sub.batch


showMessage : String -> Html a
showMessage str =
    Lists.li []
        [ Lists.content []
            [ Html.text str ]
        ]


{-| Render a list of debug data
-}
messageList : List String -> Html a
messageList messages =
    Lists.ul [] <| List.map showMessage messages


view : Model -> Html Msg
view model =
    Layout.render Mdl
        model.mdl
        [ Layout.fixedHeader
        , Layout.selectedTab model.selectedTab
        , Layout.onSelectTab SelectTab
        , Layout.scrolling
        ]
        { header =
            [ h1 [ Html.Attributes.style [ ( "padding", "2rem" ) ] ]
                [ img [ src "/images/logo_small.png" ] []
                , Html.text "LiTHe Hex"
                ]
            ]
        , drawer = []
        , tabs = ( [ text "Control", text "Debug" ], [] )
        , main = [ viewBody model ]
        }


{-| Create input for PID parameters
-}
createInputField : Model -> Int -> ( String, PIDParameter ) -> Html Msg
createInputField model idx ( desc, field ) =
    Textfield.render Mdl
        [ 1, idx ]
        model.mdl
        [ Textfield.onInput (ChangeParameter field)
        , Textfield.label desc
        ]


{-| View sliders for control when no joystick is connected
-}
viewSliderControl : Model -> Html Msg
viewSliderControl model =
    let
        joy =
            model.joystick

        setX x =
            { joy | x = x / 100 }

        setY y =
            { joy | y = y / 100 }

        setRot rot =
            { joy | rotation = rot / 100 }

        setThrust thrust =
            { joy | thrust = thrust / 100 }

        viewSlider ( min, max ) value setter =
            Slider.view
                [ Slider.onChange (setter >> AxisData)
                , Slider.value (value * 100)
                , Slider.min min
                , Slider.max max
                ]
    in
        Card.view [ Elevation.e2 ]
            [ Card.title []
                [ Card.head [] [ text "No joystick connected" ]
                , text "Set control values manually below"
                ]
            , Card.actions [ Card.border ]
                [ text ("X [A/D] " ++ toString joy.x)
                , viewSlider ( -100, 100 ) joy.x setX
                , text ("Y [W/S] " ++ toString joy.y)
                , viewSlider ( -100, 100 ) joy.y setY
                , text ("Rotation [Q/E] " ++ toString (-1 * joy.rotation))
                , viewSlider ( -100, 100 ) joy.rotation setRot
                , text ("Thrust [R/C] " ++ toString joy.thrust)
                , viewSlider ( 0, 100 ) joy.thrust setThrust
                , Button.render Mdl
                    [ 0 ]
                    model.mdl
                    [ { initialJoystick | thrust = joy.thrust }
                        |> AxisData
                        |> Button.onClick
                    ]
                    [ text "Stop" ]
                , Button.render Mdl
                    [ 1 ]
                    model.mdl
                    [ Button.onClick ResetBot ]
                    [ text "Reset" ]
                ]
            ]


{-| Show sliders or joystick visualization depending on whether a joystick has
been connected
-}
viewControl : Model -> List (Html Msg)
viewControl model =
    [ Toggles.switch Mdl
        [ 0, 1 ]
        model.mdl
        [ Toggles.onClick ToggleAuto
        , Toggles.value model.autoMode
        ]
        [ text "Autonomous mode" ]
    , if not model.autoMode then
        if model.joystickIndex /= Nothing then
            Joystick.joystickDisplay model.joystick
        else
            viewSliderControl model
      else
        Card.view [ Elevation.e2 ]
            [ Card.title [] [ Card.head [] [ text "PID parameters" ] ]
            , Card.actions [ Card.border ]
                (List.indexedMap (createInputField model)
                    [ ( "Base movement", "base_movement" )
                    , ( "Command Y", "command_y" )
                    , ( "Goal angle", "goal_angle" )
                    , ( "Angle scaledown", "angle_scaledown" )
                    , ( "Movement scaledown", "movement_scaledown" )
                    , ( "Angle adjustment", "angle_adjustment_border" )
                    ]
                    ++ [ Button.render Mdl
                            [ 0, 0 ]
                            model.mdl
                            [ Button.onClick SendParameters ]
                            [ text "duck" ]
                       ]
                )
            ]
    ]


{-| Show list of debug messages
-}
viewDebug : Model -> List (Html Msg)
viewDebug model =
    [ lazy Sensors.viewSensors model.sensorData
    , div []
        [ (messageList model.messages) ]
    ]


{-| Show control or debug tab depending on which is selected
-}
viewBody : Model -> Html Msg
viewBody model =
    if model.selectedTab == 0 then
        div [ Html.Attributes.style [ ( "padding", "2rem" ) ] ] (viewControl model)
    else
        div [ Html.Attributes.style [ ( "padding", "2rem" ) ] ] (viewDebug model)


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }
